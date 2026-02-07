import { useState } from 'react';
import { useCreatePost } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImagePlus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { processImageForUpload, handleEmptySelection } from '../utils/imageUpload';
import { normalizeBackendError } from '../utils/backendErrors';

export default function CreatePostCard() {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createPost = useCreatePost();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    // Handle empty selection (user cancels)
    if (handleEmptySelection(files)) {
      return;
    }

    const file = files![0];

    try {
      const { preview } = await processImageForUpload(file);
      setImageFile(file);
      setImagePreview(preview);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process image');
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    if (!caption.trim()) {
      toast.error('Please add a caption');
      return;
    }

    try {
      // Process and optimize image
      const { bytes } = await processImageForUpload(imageFile);
      
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createPost.mutateAsync({
        image: blob,
        caption: caption.trim(),
      });

      toast.success('Post created successfully! 🎉');
      setCaption('');
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      setOpen(false);
    } catch (error: any) {
      const errorMessage = normalizeBackendError(error);
      toast.error(errorMessage);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer rounded-3xl border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50/50 to-purple-50/50 hover:border-pink-400 hover:shadow-lg transition-all dark:border-purple-700 dark:from-gray-800/50 dark:to-gray-700/50">
          <CardContent className="flex items-center justify-center gap-3 p-6">
            <ImagePlus className="h-6 w-6 text-pink-500" />
            <span className="font-medium text-pink-700 dark:text-pink-400">Share your plushie collection</span>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Create a Post
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Plushie Photo *</Label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-pink-300 rounded-2xl cursor-pointer hover:border-pink-400 transition-colors bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:border-purple-700 dark:from-gray-800/50 dark:to-gray-700/50"
              >
                <Upload className="h-12 w-12 text-pink-400 mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <span className="text-xs text-muted-foreground mt-1">Max 10MB (auto-optimized)</span>
              </label>
            )}
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption *</Label>
            <Textarea
              id="caption"
              placeholder="Tell us about your plushie..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={1000}
              rows={4}
              className="rounded-2xl resize-none"
            />
            <p className="text-xs text-muted-foreground">{caption.length}/1000 characters</p>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium text-pink-600">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={createPost.isPending || !imageFile || !caption.trim()}
            className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium"
          >
            {createPost.isPending ? 'Posting...' : 'Share Post'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
