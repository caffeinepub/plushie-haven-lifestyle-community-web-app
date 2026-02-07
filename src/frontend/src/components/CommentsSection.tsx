import { useState } from 'react';
import { useGetCommentsForPost, useCreateComment } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { identity } = useInternetIdentity();
  const [commentText, setCommentText] = useState('');
  const { data: comments = [], isLoading } = useGetCommentsForPost(postId);
  const createComment = useCreateComment();

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await createComment.mutateAsync({ postId, content: commentText.trim() });
      setCommentText('');
      toast.success('Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (principal: string) => {
    return principal.slice(0, 2).toUpperCase();
  };

  return (
    <div className="mt-4 space-y-4">
      <Separator className="bg-pink-100 dark:bg-gray-700" />

      {/* Comment Form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[60px] rounded-2xl resize-none"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={createComment.isPending || !commentText.trim()}
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-[60px] px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 rounded-2xl bg-pink-50/50 dark:bg-gray-700/50 p-3">
              <Avatar className="h-8 w-8 border-2 border-pink-200">
                <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-white text-xs">
                  {getInitials(comment.author.toString())}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium truncate">
                    {comment.author.toString().slice(0, 12)}...
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
