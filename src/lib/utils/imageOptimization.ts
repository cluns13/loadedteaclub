import { getPlaiceholder } from 'plaiceholder';
import { Buffer } from 'buffer';
import { ImageProps } from 'next/image';

export interface OptimizedImageData {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

export class ImageOptimizer {
  // Generate blur placeholder for images
  static async generateBlurPlaceholder(imageUrl: string): Promise<string | null> {
    try {
      const { base64 } = await getPlaiceholder(imageUrl);
      return base64;
    } catch (error) {
      console.error('Error generating blur placeholder:', error);
      return null;
    }
  }

  // Optimize image for performance
  static async optimizeImage(
    src: string, 
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    }
  ): Promise<OptimizedImageData> {
    const blurDataURL = await this.generateBlurPlaceholder(src);

    return {
      src,
      width: options?.width || 800,
      height: options?.height || 600,
      blurDataURL,
      ...options
    };
  }

  // Create responsive image configuration
  static createResponsiveImageProps(
    src: string, 
    alt: string, 
    options?: Partial<ImageProps>
  ): ImageProps {
    return {
      src,
      alt,
      width: 800,
      height: 600,
      loading: 'lazy',
      placeholder: 'blur',
      quality: 75,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      ...options
    };
  }

  // Preload critical images
  static preloadImage(src: string): void {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  }
}

// Utility hook for client-side image optimization
export function useImageOptimization() {
  const optimizeImage = async (src: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }) => {
    return ImageOptimizer.optimizeImage(src, options);
  };

  return { optimizeImage };
}
