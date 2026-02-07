import { useState } from 'react';
import { useGetEventComments, useCreateEventComment, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface EventCommentsSectionProps {
  postId: string;
}

export default function EventCommentsSection({ postId }: EventCommentsSectionProps) {
  const { identity } = useInternetIdentity();
  const [commentText, setCommentText] = useState('');
  const { data: comments = [], isLoading } = useGetEventComments(postId);
  const createComment = useCreateEventComment();

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await createComment.mutateAsync({
        postId,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to post comment. Please try again.');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-4 space-y-4 border-t border-pink-100 dark:border-gray-700 pt-4">
      {/* Comment Form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Share your thoughts or participation..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[80px] rounded-2xl resize-none"
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!commentText.trim() || createComment.isPending}
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white h-10 w-10 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} formatTimestamp={formatTimestamp} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to participate!
          </p>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, formatTimestamp }: { comment: any; formatTimestamp: (ts: bigint) => string }) {
  const { data: authorProfile } = useGetUserProfile(comment.author.toString());

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 border-2 border-pink-200 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-white text-xs">
          {authorProfile ? getInitials(authorProfile.username) : comment.author.toString().slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-sm font-medium">
            {authorProfile ? authorProfile.username : `${comment.author.toString().slice(0, 12)}...`}
          </p>
          <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
      </div>
    </div>
  );
}
