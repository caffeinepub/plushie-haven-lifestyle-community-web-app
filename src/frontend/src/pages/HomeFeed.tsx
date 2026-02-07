import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllPosts, useGetCallerUserProfile } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import CreatePostCard from '../components/CreatePostCard';
import DailyPromptCard from '../components/DailyPromptCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Image as ImageIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MOOD_TAGS = [
  { name: 'All', emoji: '✨' },
  { name: 'Cute', emoji: '🥰' },
  { name: 'Funny', emoji: '😄' },
  { name: 'Creative', emoji: '🎨' },
  { name: 'Cozy', emoji: '☕' },
  { name: 'Nostalgic', emoji: '💭' },
];

export default function HomeFeed() {
  const { identity } = useInternetIdentity();
  const { data: posts, isLoading } = useGetAllPosts();
  const { data: userProfile } = useGetCallerUserProfile();
  const [selectedMood, setSelectedMood] = useState('All');

  const isAuthenticated = !!identity;

  // Note: Mood filtering will work once backend implements mood tags
  const filteredPosts = posts || [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 p-8 text-center shadow-lg">
        <img
          src="/assets/generated/hero-plushie.dim_800x600.png"
          alt="Plushie Haven Hero"
          className="mx-auto mb-4 h-48 w-auto rounded-2xl object-cover shadow-md"
        />
        <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Share Your Plushie Love
        </h2>
        <p className="text-muted-foreground">
          A warm and welcoming community for adult plushie enthusiasts to share collections, stories, and recommendations.
        </p>
      </div>

      {/* Daily Cozy Prompt */}
      {isAuthenticated && <DailyPromptCard />}

      {/* Create Post Section */}
      {isAuthenticated && userProfile && (
        <div className="mb-6">
          <CreatePostCard />
        </div>
      )}

      {/* Mood Filter */}
      {isAuthenticated && (
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Community Feed</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full gap-2">
                <Filter className="h-4 w-4" />
                {selectedMood === 'All' ? 'Filter by Mood' : `${MOOD_TAGS.find(m => m.name === selectedMood)?.emoji} ${selectedMood}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {MOOD_TAGS.map((mood) => (
                <DropdownMenuItem
                  key={mood.name}
                  onClick={() => setSelectedMood(mood.name)}
                  className="cursor-pointer gap-2"
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span>{mood.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-64 w-full rounded-2xl mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="rounded-3xl bg-white dark:bg-gray-800 p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
              <ImageIcon className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              {isAuthenticated
                ? 'Be the first to share your plushie collection!'
                : 'Join the community to see and share plushie posts.'}
            </p>
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                <Heart className="inline h-4 w-4 fill-pink-500 text-pink-500" /> Log in to start sharing
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
