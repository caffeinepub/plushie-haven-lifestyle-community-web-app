import { useState } from 'react';
import { GroupPost } from '../backend';
import { useGetGroupComments } from '../hooks/useQueries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import GroupCommentsSection from './GroupCommentsSection';

interface GroupPostCardProps {
  post: GroupPost;
  groupId: string;
}

export default function GroupPostCard({ post, groupId }: GroupPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { data: comments = [] } = useGetGroupComments(post.id);

  const imageUrl = post.image?.getDirectURL();

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

  const getInitials = (principal: string) => {
    return principal.slice(0, 2).toUpperCase();
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

      {/* Content */}
      {post.content && (
        <p className="mb-4 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
      )}

      {/* Image */}
      {imageUrl && (
        <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
          <img
            src={imageUrl}
            alt="Post image"
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-pink-100 dark:border-gray-700 pt-4">
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
      {showComments && <GroupCommentsSection postId={post.id} groupId={groupId} />}
    </article>
  );
}
