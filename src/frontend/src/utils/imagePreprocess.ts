// Client-side image preprocessing: resize, compress, and handle orientation
export interface PreprocessedImage {
  bytes: Uint8Array<ArrayBuffer>;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
}

const MAX_DIMENSION = 1920; // Max width or height
const JPEG_QUALITY = 0.85; // Compression quality

export async function preprocessImage(file: File): Promise<PreprocessedImage> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image with proper orientation handling
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Convert blob to Uint8Array with proper ArrayBuffer type
            const reader = new FileReader();
            reader.onload = () => {
              const arrayBuffer = reader.result as ArrayBuffer;
              const uint8Array = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;

              resolve({
                bytes: uint8Array,
                width,
                height,
                originalSize,
                optimizedSize: uint8Array.length,
              });
            };
            reader.onerror = () => reject(new Error('Failed to read compressed image'));
            reader.readAsArrayBuffer(blob);
          },
          'image/jpeg',
          JPEG_QUALITY
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    reader.readAsDataURL(file);
  });
}
