import { toast } from 'sonner';
import { preprocessImage } from './imagePreprocess';

const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024; // 10MB original file limit
const MAX_OPTIMIZED_SIZE = 5 * 1024 * 1024; // 5MB optimized limit

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ProcessedImageData {
  bytes: Uint8Array<ArrayBuffer>;
  preview: string;
}

// Validate image file selection
export function validateImageFile(file: File | null | undefined): ImageValidationResult {
  if (!file) {
    return { isValid: false, error: 'Please select an image' };
  }

  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file (JPEG, PNG, etc.)' };
  }

  if (file.size > MAX_ORIGINAL_SIZE) {
    return { isValid: false, error: `Image must be less than ${MAX_ORIGINAL_SIZE / 1024 / 1024}MB` };
  }

  return { isValid: true };
}

// Create preview URL from file
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to create preview'));
    reader.readAsDataURL(file);
  });
}

// Process image: validate, preprocess, and enforce final size limit
export async function processImageForUpload(file: File | null | undefined): Promise<ProcessedImageData> {
  // Validate
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Create preview
  const preview = await createImagePreview(file!);

  // Preprocess (resize & compress)
  const preprocessed = await preprocessImage(file!);

  // Enforce final optimized size limit
  if (preprocessed.optimizedSize > MAX_OPTIMIZED_SIZE) {
    throw new Error(
      `Image is still too large after optimization (${(preprocessed.optimizedSize / 1024 / 1024).toFixed(1)}MB). Please try a smaller image.`
    );
  }

  return {
    bytes: preprocessed.bytes,
    preview,
  };
}

// Handle empty file selection (user cancels file picker)
export function handleEmptySelection(files: FileList | null): boolean {
  return !files || files.length === 0;
}
