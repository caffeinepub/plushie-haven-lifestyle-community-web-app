import { useState } from 'react';
import { PlushiePost } from '../backend';
import { useGetLikeCount, useHasUserLiked, useToggleLike, useGetCommentsForPost, useGetReactions, useToggleEmojiReaction } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import CommentsSection from './CommentsSection';
import { EMOJI_REACTIONS } from '../constants/emojiReactions';

interface PostCardProps {
  post: PlushiePost;
}

export default function PostCard({ post }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const [showComments, setShowComments] = useState(false);
  const { data: likeCount = 0n } = useGetLikeCount(post.id);
  const { data: hasLiked = false } = useHasUserLiked(post.id);
  const { data: comments = [] } = useGetCommentsForPost(post.id);
  const { data: reactions = [] } = useGetReactions(post.id);
  const toggleLike = useToggleLike();
  const toggleEmojiReaction = useToggleEmojiReaction();

  const isAuthenticated = !!identity;
  const imageUrl = post.image.getDirectURL();

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

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like posts');
      return;
    }
    try {
      await toggleLike.mutateAsync(post.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleEmojiReaction = async (emojiId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to react to posts');
      return;
    }
    try {
      await toggleEmojiReaction.mutateAsync({ postId: post.id, emojiId });
    } catch (error) {
      console.error('Failed to toggle emoji reaction:', error);
    }
  };

  const getInitials = (principal: string) => {
    return principal.slice(0, 2).toUpperCase();
  };

  // Get reaction count for a specific emoji
  const getReactionCount = (emojiId: string): number => {
    const reaction = reactions.find((r) => r.emoji === emojiId);
    return reaction ? Number(reaction.count) : 0;
  };

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-shadow hover:shadow-xl">
      {/* Author Info */}
      <div className="mb-4 flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-pink-300">
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white text-sm">
            {getInitials(post.author.toString())}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{post.author.toString().slice(0, 12)}...</p>
          <p className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
        </div>
      </div>

      {/* Image */}
      <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
        <img
          src={imageUrl}
          alt={post.caption}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <p className="mb-4 text-sm leading-relaxed">{post.caption}</p>

      {/* Quick Emoji Reactions */}
      <div className="mb-3 flex flex-wrap gap-2">
        {EMOJI_REACTIONS.map((reaction) => {
          const count = getReactionCount(reaction.id);
          return (
            <Button
              key={reaction.id}
              variant="outline"
              size="sm"
              onClick={() => handleEmojiReaction(reaction.id)}
              disabled={!isAuthenticated || toggleEmojiReaction.isPending}
              className={cn(
                'rounded-full h-8 px-3 text-sm gap-1.5 transition-all',
                count > 0 && 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700'
              )}
              title={isAuthenticated ? reaction.label : 'Log in to react'}
            >
              <span className="text-base">{reaction.emoji}</span>
              {count > 0 && <span className="font-medium">{count}</span>}
            </Button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={!isAuthenticated}
          className={cn(
            'gap-2 rounded-full',
            hasLiked && 'text-pink-600 dark:text-pink-400'
          )}
        >
          <Heart className={cn('h-4 w-4', hasLiked && 'fill-current')} />
          <span>{Number(likeCount)}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="gap-2 rounded-full"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && <CommentsSection postId={post.id} />}
    </article>
  );
}
