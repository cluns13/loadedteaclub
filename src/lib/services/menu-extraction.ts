import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { ProcessedMenu } from '@/types/models';

// Initialize AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 2000; // Maximum width or height

async function compressImage(buffer: Buffer): Promise<Buffer> {
  console.log('Original image size:', buffer.length, 'bytes');
  
  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  console.log('Image metadata:', metadata);

  // Calculate resize dimensions while maintaining aspect ratio
  let width = metadata.width;
  let height = metadata.height;
  if (width && height) {
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
  }

  // Compress the image
  const compressed = await sharp(buffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({
      quality: 80,
      progressive: true,
      optimizeScans: true
    })
    .toBuffer();

  console.log('Compressed image size:', compressed.length, 'bytes');
  return compressed;
}

export async function uploadMenuFile(file: Buffer, fileName: string): Promise<string> {
  try {
    const fileId = uuidv4();
    const extension = fileName.split('.').pop()?.toLowerCase();
    const key = `menus/${fileId}.${extension}`;

    console.log('Processing file for upload:', {
      fileId,
      extension,
      key,
      originalSize: file.length
    });

    // Optimize image if it's not a PDF
    let fileBuffer = file;
    if (extension !== 'pdf') {
      console.log('Optimizing image...');
      fileBuffer = await sharp(file)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      console.log('Image optimized. New size:', fileBuffer.length);
    }

    console.log('Uploading to S3...');
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: fileBuffer,
      ContentType: extension === 'pdf' ? 'application/pdf' : 'image/jpeg',
    }));
    console.log('Upload to S3 complete');

    return key;
  } catch (error) {
    console.error('Error in uploadMenuFile:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export async function processMenuFile(
  file: Buffer, 
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<ProcessedMenu> {
  try {
    console.log('Starting menu file processing...');
    console.log('Input file size:', file.length, 'bytes');
    onProgress?.(5);

    // Check file size
    if (file.length > MAX_IMAGE_SIZE) {
      console.log('Image too large, compressing...');
      file = await compressImage(file);
      if (file.length > MAX_IMAGE_SIZE) {
        throw new Error('Image file is too large. Please upload a smaller image or reduce the image quality.');
      }
    }
    onProgress?.(10);

    // Optimize image for OCR
    const optimizedImageBuffer = await sharp(file)
      .normalize() // Enhance contrast
      .sharpen() // Improve text clarity
      .toBuffer();
    
    onProgress?.(20);
    console.log('Image optimized for OCR');

    // Extract text using Tesseract
    console.log('Starting text extraction...');
    const extractedText = await extractMenuText(optimizedImageBuffer, (p) => {
      onProgress?.(20 + Math.floor(p * 0.4)); // 20-60% progress
    });
    
    onProgress?.(60);
    console.log('Text extracted:', extractedText.slice(0, 100) + '...');

    // Process with OpenAI
    console.log('Processing with OpenAI...');
    const processedMenu = await processMenuItems(extractedText);
    
    onProgress?.(80);

    // Upload image to S3
    console.log('Uploading image to S3...');
    const imageUrl = await uploadMenuFile(file, fileName);
    
    onProgress?.(100);
    console.log('Menu processing completed');

    // Calculate confidence
    const confidence = calculateConfidence(processedMenu);
    
    return { 
      ...processedMenu, 
      confidence, 
      needsReview: confidence < 0.8,
      imageUrl 
    };
  } catch (error) {
    console.error('Error in processMenuFile:', error);
    throw error;
  }
}

async function extractMenuText(
  imageBuffer: Buffer,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log('Initializing Tesseract worker...');
    const worker = await createWorker('eng');
    
    console.log('Starting OCR...');
    const { data: { text } } = await worker.recognize(imageBuffer);
    
    await worker.terminate();
    return text;
  } catch (error) {
    console.error('Error in extractMenuText:', error);
    throw error;
  }
}

async function processMenuItems(text: string): Promise<ProcessedMenu> {
  try {
    console.log('Processing menu text with OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that processes menu text into structured data. 
          Extract menu items and organize them into categories. Each menu item should have a name, description, and category.
          The output should match this TypeScript interface:

          interface MenuItem {
            name: string;
            description: string;
            category: 'DRINKS' | 'SHAKES' | 'SNACKS' | 'SPECIALTY';
            benefits?: string[];
            popular?: boolean;
            price?: string;
          }

          interface ProcessedMenu {
            items: MenuItem[];
            confidence: number;
            rawText: string;
          }

          Focus on identifying:
          1. Item names
          2. Item descriptions
          3. Categories (must be one of: DRINKS, SHAKES, SNACKS, SPECIALTY)
          4. Prices (if present)
          5. Health benefits or special features (for benefits array)
          6. Popular/signature items (mark as popular: true)`
        },
        {
          role: "user",
          content: `Please process this menu text into a structured format: \n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    const parsedMenu = JSON.parse(result);
    if (!parsedMenu.items || !Array.isArray(parsedMenu.items)) {
      throw new Error('Invalid menu structure returned from OpenAI');
    }

    // Ensure all items have valid categories
    parsedMenu.items = parsedMenu.items.map(item => ({
      ...item,
      category: item.category || 'SPECIALTY',
      benefits: item.benefits || [],
      popular: item.popular || false
    }));

    return {
      ...parsedMenu,
      rawText: text,
      needsReview: parsedMenu.confidence < 0.8
    };
  } catch (error) {
    console.error('Error in processMenuItems:', error);
    throw error;
  }
}

function calculateConfidence(menuData: any): number {
  let score = 1.0;
  
  // Check for missing or incomplete data
  if (!menuData.items || menuData.items.length === 0) score -= 0.3;
  
  menuData.items?.forEach((item: any) => {
    if (!item.price) score -= 0.05;
    if (!item.name) score -= 0.1;
  });

  return Math.max(0, score);
}
