import { NextResponse } from 'next/server';
import { processMenuFile } from '@/lib/services/menu-extraction';

export const maxDuration = 300; // Set max duration to 5 minutes

export async function POST(
  req: Request,
  { params }: { params: { businessId: string } }
) {
  try {
    console.log('Received menu upload request for business:', params.businessId);

    if (!params.businessId) {
      console.error('No business ID provided');
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // Log the request headers
    const headers = Object.fromEntries(req.headers.entries());
    console.log('Request headers:', headers);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('Received file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({
        error: 'Invalid file type. Please upload a PDF or image file (JPEG, PNG).'
      }, { status: 400 });
    }

    // Convert file to buffer
    console.log('Converting file to buffer...');
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer. Size:', buffer.length);

    // Verify OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing');
      return NextResponse.json({ 
        error: 'Server configuration error. Please contact support.',
        details: 'OpenAI API key is missing'
      }, { status: 500 });
    }
    
    // Process the menu with progress updates
    console.log('Starting menu processing...');
    let lastProgress = 0;
    const processedMenu = await processMenuFile(buffer, file.name, (progress) => {
      if (progress > lastProgress) {
        console.log(`Processing progress: ${progress}%`);
        lastProgress = progress;
      }
    });
    console.log('Menu processing completed successfully');

    return NextResponse.json({
      success: true,
      businessId: params.businessId,
      processedMenu,
    });
  } catch (error) {
    console.error('Menu extraction error:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);

      return NextResponse.json({
        error: 'Failed to process menu',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'An unexpected error occurred',
      details: 'Please try again or contact support if the problem persists'
    }, { status: 500 });
  }
}
