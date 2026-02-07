import { useState } from 'react';
import { useRouter, useParams } from '@tanstack/react-router';
import {
  useGetGroupDetails,
  useGetGroupPosts,
  useCreateGroupPost,
  useLeaveGroup,
  useIsUserGroupMember,
  useIsCallerAdmin,
  useDeleteGroup,
  useGetGroupMembers,
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Users, ImagePlus, Send, X, Shield, Trash2, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import GroupPostCard from '../components/GroupPostCard';
import GroupMembersDialog from '../components/GroupMembersDialog';
import { ExternalBlob } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { processImageForUpload, handleEmptySelection } from '../utils/imageUpload';
import { normalizeBackendError } from '../utils/backendErrors';

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams({ from: '/community/$groupId' });
  const groupId = params.groupId;
  const { identity } = useInternetIdentity();

  const [postContent, setPostContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: groupDetails, isLoading: groupLoading } = useGetGroupDetails(groupId);
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useGetGroupPosts(groupId);
  const { data: isMember = false, isLoading: membershipLoading } = useIsUserGroupMember(groupId);
  const { data: isAdmin = false } = useIsCallerAdmin();
  const createPost = useCreateGroupPost();
  const leaveGroup = useLeaveGroup();
  const deleteGroup = useDeleteGroup();

  const isCreator = identity && groupDetails && groupDetails.creator.toString() === identity.getPrincipal().toString();
  const canDeleteGroup = isCreator || isAdmin;

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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postContent.trim() && !imageFile) {
      toast.error('Please add some content or an image');
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
        groupId,
        content: postContent.trim(),
        image: blob,
      });

      toast.success('Post created successfully! 🎉');
      setPostContent('');
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      
      await refetchPosts();
    } catch (error: any) {
      const errorMessage = normalizeBackendError(error);
      toast.error(errorMessage);
      setUploadProgress(0);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupDetails) return;
    
    try {
      await leaveGroup.mutateAsync(groupId);
      toast.success(`Left ${groupDetails.name}`);
      router.navigate({ to: '/community' });
    } catch (error: any) {
      const errorMessage = normalizeBackendError(error);
      toast.error(errorMessage);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup.mutateAsync(groupId);
      toast.success('Group deleted successfully');
      setShowDeleteDialog(false);
      router.navigate({ to: '/community' });
    } catch (error: any) {
      const errorMessage = normalizeBackendError(error);
      toast.error(errorMessage);
    }
  };

  if (groupLoading || membershipLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <Card className="rounded-3xl mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
        </Card>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!groupDetails || !isMember) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.navigate({ to: '/community' })}
          className="mb-6 rounded-full gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Button>
        <Card className="rounded-3xl p-12 text-center">
          <h3 className="mb-2 text-xl font-semibold">Access Denied</h3>
          <p className="text-muted-foreground mb-4">
            {!groupDetails ? 'Group not found' : 'You must be a member to view this group'}
          </p>
          <Button
            onClick={() => router.navigate({ to: '/community' })}
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            Browse Groups
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.navigate({ to: '/community' })}
        className="mb-6 rounded-full gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Button>

      {/* Group Header */}
      <Card className="rounded-3xl mb-6 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {groupDetails.name}
                </CardTitle>
                {isAdmin && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base mb-4">{groupDetails.description}</CardDescription>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{groupDetails.memberCount} {groupDetails.memberCount === 1 ? 'member' : 'members'}</span>
                </div>
                <GroupMembersDialog groupId={groupId} isAdmin={isAdmin} />
              </div>
            </div>
            <div className="flex gap-2">
              {canDeleteGroup && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              {!isCreator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeaveGroup}
                  disabled={leaveGroup.isPending}
                  className="rounded-full"
                >
                  {leaveGroup.isPending ? 'Leaving...' : 'Leave Group'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Post */}
      <Card className="rounded-3xl mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Share with the group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">What's on your mind?</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts, stories, or questions..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                maxLength={2000}
                rows={4}
                className="rounded-2xl resize-none"
              />
              <p className="text-xs text-muted-foreground">{postContent.length}/2000 characters</p>
            </div>

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
              <div>
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-pink-300 rounded-2xl cursor-pointer hover:border-pink-400 transition-colors bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:border-purple-700 dark:from-gray-800/50 dark:to-gray-700/50"
                >
                  <ImagePlus className="h-8 w-8 text-pink-400 mb-2" />
                  <span className="text-sm text-muted-foreground">Add an image (optional)</span>
                </label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}

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

            <Button
              type="submit"
              disabled={createPost.isPending || (!postContent.trim() && !imageFile)}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium gap-2"
            >
              <Send className="h-4 w-4" />
              {createPost.isPending ? 'Posting...' : 'Post to Group'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {postsLoading ? (
          <>
            {[1, 2].map((i) => (
              <Card key={i} className="rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => <GroupPostCard key={post.id} post={post} groupId={groupId} />)
        ) : (
          <Card className="rounded-3xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
              <ImagePlus className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No posts yet</h3>
            <p className="text-muted-foreground">Be the first to share something with the group!</p>
          </Card>
        )}
      </div>

      {/* Delete Group Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{groupDetails.name}"? This will permanently delete the group and all its posts and comments. This action cannot be undone.
              {isAdmin && !isCreator && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  You are deleting this group as an admin.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGroup.isPending ? 'Deleting...' : 'Delete Group'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
