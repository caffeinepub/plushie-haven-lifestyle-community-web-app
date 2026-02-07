// Normalize backend/canister errors into user-friendly messages
export function normalizeBackendError(error: any): string {
  const errorMessage = error?.message || error?.toString() || '';

  // Unauthorized errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only users can')) {
    return 'You must be logged in to perform this action';
  }

  // Payload/size errors
  if (errorMessage.includes('payload too large') || errorMessage.includes('Image too large')) {
    return 'Image is too large. Please try a smaller file';
  }

  // Validation errors
  if (errorMessage.includes('Caption is required') || errorMessage.includes('required')) {
    return 'Please fill in all required fields';
  }

  if (errorMessage.includes('Group creator cannot leave')) {
    return 'Group creators cannot leave their own group';
  }

  if (errorMessage.includes('Only group members')) {
    return 'Only group members can perform this action';
  }

  // Generic fallback
  return 'An error occurred. Please try again';
}
