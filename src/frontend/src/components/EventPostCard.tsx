import { useState } from 'react';
import { EventPost } from '../backend';
import { useGetEventComments, useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar } from 'lucide-react';
import EventCommentsSection from './EventCommentsSection';

interface EventPostCardProps {
  event: EventPost;
}

export default function EventPostCard({ event }: EventPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { data: comments = [] } = useGetEventComments(event.id);
  const { data: creatorProfile } = useGetUserProfile(event.createdBy.toString());

  const imageUrl = event.image?.getDirectURL();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
      {/* Event Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 flex-shrink-0">
            <Calendar className="h-6 w-6 text-pink-600 dark:text-pink-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {event.title}
            </h3>
            <p className="text-xs text-muted-foreground">{formatTimestamp(event.timestamp)}</p>
          </div>
        </div>
      </div>

      {/* Event Image */}
      {imageUrl && (
        <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
          <img
            src={imageUrl}
            alt={event.title}
            className="h-auto w-full object-cover max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Event Description */}
      <p className="mb-4 text-sm leading-relaxed whitespace-pre-wrap break-words">{event.description}</p>

      {/* Creator Info */}
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Avatar className="h-6 w-6 border border-pink-200">
          <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-white text-xs">
            {creatorProfile ? getInitials(creatorProfile.username) : event.createdBy.toString().slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>
          Created by {creatorProfile ? creatorProfile.username : `${event.createdBy.toString().slice(0, 12)}...`}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-pink-100 dark:border-gray-700 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="rounded-full gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && <EventCommentsSection postId={event.id} />}
    </article>
  );
}
