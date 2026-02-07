import { useState } from 'react';
import { CollectionPost } from '../backend';
import { useGetCollectionLikeCount, useHasUserLikedCollection, useToggleCollectionLike, useGetCollectionComments, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import CollectionCommentsSection from './CollectionCommentsSection';

interface CollectionPostCardProps {
  post: CollectionPost;
}

export default function CollectionPostCard({ post }: CollectionPostCardProps) {
  const { identity } = useInternetIdentity();
  const [showComments, setShowComments] = useState(false);
  const { data: likeCount = 0n } = useGetCollectionLikeCount(post.id);
  const { data: hasLiked = false } = useHasUserLikedCollection(post.id);
  const { data: comments = [] } = useGetCollectionComments(post.id);
  const { data: authorProfile } = useGetUserProfile(post.author.toString());
  const toggleLike = useToggleCollectionLike();

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
    if (!isAuthenticated) return;
    try {
      await toggleLike.mutateAsync(post.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-shadow hover:shadow-xl">
      {/* Author Info */}
      <div className="mb-4 flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-pink-300">
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white text-sm">
            {authorProfile ? getInitials(authorProfile.username) : post.author.toString().slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">
            {authorProfile ? authorProfile.username : `${post.author.toString().slice(0, 12)}...`}
          </p>
          <p className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
        </div>
      </div>

      {/* Image */}
      <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
        <img
          src={imageUrl}
          alt="Collection"
          className="h-auto w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="mb-4 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.caption}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-pink-100 dark:border-gray-700 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={!isAuthenticated || toggleLike.isPending}
          className={cn(
            'rounded-full gap-2 transition-all',
            hasLiked && 'text-pink-600 dark:text-pink-400'
          )}
        >
          <Heart
            className={cn('h-5 w-5 transition-all', hasLiked && 'fill-pink-600 dark:fill-pink-400')}
          />
          <span className="font-medium">{Number(likeCount)}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="rounded-full gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{comments.length}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && <CollectionCommentsSection postId={post.id} />}
    </article>
  );
}
