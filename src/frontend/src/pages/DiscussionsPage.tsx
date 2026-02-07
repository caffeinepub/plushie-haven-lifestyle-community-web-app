import { useState } from 'react';
import { useGetAllDiscussionPosts, useCreateDiscussionPost } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import DiscussionPostCard from '../components/DiscussionPostCard';
import { processImageForUpload, handleEmptySelection } from '../utils/imageUpload';
import { normalizeBackendError } from '../utils/backendErrors';

const TOPICS = [
  { id: 'Favorite Plushie', label: 'Favorite Plushie', emoji: '💖' },
  { id: 'New Additions', label: 'New Additions', emoji: '✨' },
  { id: 'Sharing Stories', label: 'Sharing Stories', emoji: '📖' },
];

export default function DiscussionsPage() {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0].id);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: posts = [], isLoading } = useGetAllDiscussionPosts(selectedTopic);
  const createPost = useCreateDiscussionPost();

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

    if (!content.trim()) {
      toast.error('Please add some content');
      return;
    }

    try {
      let blob: ExternalBlob | undefined;
      if (imageFile) {
        const { bytes } = await processImageForUpload(imageFile);
        blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await createPost.mutateAsync({
        topic: selectedTopic,
        content: content.trim(),
        image: blob,
      });

      toast.success('Discussion post created! 🎉');
      setContent('');
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
          <MessageSquare className="h-10 w-10 text-pink-600 dark:text-pink-300" />
        </div>
        <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Discussions & Threads
        </h2>
        <p className="text-muted-foreground">
          Join conversations about your favorite plushies and share your stories
        </p>
      </div>

      {/* Topic Tabs */}
      <Tabs value={selectedTopic} onValueChange={setSelectedTopic} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 p-1">
          {TOPICS.map((topic) => (
            <TabsTrigger
              key={topic.id}
              value={topic.id}
              className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md"
            >
              <span className="mr-2">{topic.emoji}</span>
              {topic.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TOPICS.map((topic) => (
          <TabsContent key={topic.id} value={topic.id} className="space-y-6 mt-6">
            {/* Create Post Button */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium gap-2 h-12">
                  <Plus className="h-5 w-5" />
                  Start a Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    Start a Discussion
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={2000}
                      rows={6}
                      className="rounded-2xl resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{content.length}/2000 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image (optional)</Label>
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
                    disabled={createPost.isPending || !content.trim()}
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium"
                  >
                    {createPost.isPending ? 'Posting...' : 'Post Discussion'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Posts List */}
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="rounded-3xl p-6">
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </Card>
                ))}
              </>
            ) : posts.length > 0 ? (
              posts.map((post) => <DiscussionPostCard key={post.id} post={post} />)
            ) : (
              <Card className="rounded-3xl p-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
                  <MessageSquare className="h-10 w-10 text-pink-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No discussions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion about {topic.label.toLowerCase()}!
                </p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
