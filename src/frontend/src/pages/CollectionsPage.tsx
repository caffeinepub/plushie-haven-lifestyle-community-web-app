import { useState } from 'react';
import { useGetAllCollectionPosts, useCreateCollectionPost } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import CollectionPostCard from '../components/CollectionPostCard';
import { processImageForUpload, handleEmptySelection } from '../utils/imageUpload';
import { normalizeBackendError } from '../utils/backendErrors';

export default function CollectionsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: posts = [], isLoading } = useGetAllCollectionPosts();
  const createPost = useCreateCollectionPost();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
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
      e.target.value = '';
    }
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
      const { bytes } = await processImageForUpload(imageFile);
      
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createPost.mutateAsync({
        image: blob,
        caption: caption.trim(),
      });

      toast.success('Collection post created! 🎉');
      setCaption('');
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      setShowCreateDialog(false);
    } catch (error: any) {
      const errorMessage = normalizeBackendError(error);
      toast.error(errorMessage);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800">
          <ImageIcon className="h-10 w-10 text-pink-600 dark:text-pink-300" />
        </div>
        <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Collections & Show & Tell
        </h2>
        <p className="text-muted-foreground">
          Share your plushies, DIY creations, and collections with the community
        </p>
      </div>

      {/* Create Post Button */}
      <div className="mb-6">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium gap-2 h-12">
              <Plus className="h-5 w-5" />
              Share Your Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Share Your Collection
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Image *</Label>
                <div className="flex flex-col gap-3">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="rounded-2xl"
                  />
                  {imagePreview && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
                      <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-64 object-contain" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption *</Label>
                <Textarea
                  id="caption"
                  placeholder="Tell us about your collection..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="rounded-2xl resize-none"
                />
                <p className="text-xs text-muted-foreground">{caption.length}/1000 characters</p>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-pink-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button
                type="submit"
                disabled={createPost.isPending || !imageFile || !caption.trim()}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium"
              >
                {createPost.isPending ? 'Posting...' : 'Share Collection'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-3xl p-6">
                <Skeleton className="h-64 w-full mb-4 rounded-2xl" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => <CollectionPostCard key={post.id} post={post} />)
        ) : (
          <Card className="rounded-3xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
              <ImageIcon className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No collections yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your plushie collection!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
