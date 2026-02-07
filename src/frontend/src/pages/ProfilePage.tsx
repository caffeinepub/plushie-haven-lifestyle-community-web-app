import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetPostsByUser } from '../hooks/useQueries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Award, Heart, MessageCircle, Image as ImageIcon, Tag, Star } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import ProfileCustomizationModal from '../components/ProfileCustomizationModal';

// Mock achievements - will be replaced with backend data
const MOCK_ACHIEVEMENTS = [
  { id: '1', name: 'First Post', description: 'Shared your first plushie', emoji: '🎉', earned: true },
  { id: '2', name: 'Social Butterfly', description: 'Made 10 comments', emoji: '🦋', earned: true },
  { id: '3', name: 'Collector', description: 'Posted 5 plushies', emoji: '🧸', earned: true },
  { id: '4', name: 'Community Star', description: 'Received 50 likes', emoji: '⭐', earned: false },
  { id: '5', name: 'Event Participant', description: 'Joined an event', emoji: '🎪', earned: false },
];

const BACKGROUND_OPTIONS = [
  { id: 'default', name: 'Default', gradient: 'from-pink-100 via-purple-100 to-blue-100' },
  { id: 'sunset', name: 'Sunset', gradient: 'from-orange-100 via-pink-100 to-purple-100' },
  { id: 'ocean', name: 'Ocean', gradient: 'from-blue-100 via-cyan-100 to-teal-100' },
  { id: 'forest', name: 'Forest', gradient: 'from-green-100 via-emerald-100 to-teal-100' },
  { id: 'lavender', name: 'Lavender', gradient: 'from-purple-100 via-pink-100 to-purple-100' },
];

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: userPosts, isLoading: postsLoading } = useGetPostsByUser(identity?.getPrincipal().toString() || '');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('default');
  const [favoriteTags, setFavoriteTags] = useState<string[]>(['Vintage', 'Kawaii', 'DIY']);
  const [topCollection, setTopCollection] = useState<string[]>([]);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-white dark:bg-gray-800 p-12 shadow-lg">
          <Award className="h-16 w-16 mx-auto mb-4 text-pink-500" />
          <h2 className="text-2xl font-bold mb-2">Profile Access</h2>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-64 w-full rounded-3xl mb-6" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const currentBackground = BACKGROUND_OPTIONS.find(bg => bg.id === selectedBackground) || BACKGROUND_OPTIONS[0];
  const earnedAchievements = MOCK_ACHIEVEMENTS.filter(a => a.earned);

  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header with Custom Background */}
        <Card className={`mb-6 rounded-3xl overflow-hidden shadow-lg border-2 border-pink-200 dark:border-purple-700`}>
          <div className={`h-32 bg-gradient-to-r ${currentBackground.gradient} dark:opacity-80`} />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-4">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white text-2xl">
                  {getInitials(userProfile.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{userProfile.username}</h1>
                  {earnedAchievements.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Award className="h-3 w-3" />
                      {earnedAchievements.length}
                    </Badge>
                  )}
                </div>
                {userProfile.bio && (
                  <p className="text-muted-foreground mb-2">{userProfile.bio}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {userPosts?.length || 0} Posts
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomization(true)}
                  className="rounded-full gap-2"
                >
                  <Star className="h-4 w-4" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditProfile(true)}
                  className="rounded-full gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Favorite Tags */}
            {favoriteTags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-pink-500" />
                  <span className="text-sm font-medium">Favorite Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favoriteTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-full">
            <TabsTrigger value="posts" className="rounded-full">Posts</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-full">Achievements</TabsTrigger>
            <TabsTrigger value="collection" className="rounded-full">Top Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {postsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : userPosts && userPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userPosts.map((post) => (
                  <Card key={post.id} className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <img
                      src={post.image.getDirectURL()}
                      alt="Post"
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <p className="text-sm line-clamp-2 mb-2">{post.caption}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          Comments
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-3xl p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No posts yet. Start sharing your plushie collection!</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_ACHIEVEMENTS.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`rounded-2xl p-6 ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 border-pink-300 dark:border-purple-700'
                      : 'opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{achievement.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && (
                        <Badge variant="secondary" className="mt-2">
                          <Award className="h-3 w-3 mr-1" />
                          Earned
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collection" className="space-y-4">
            <Card className="rounded-3xl p-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-pink-500" />
              <h3 className="text-lg font-semibold mb-2">Top Collection Highlights</h3>
              <p className="text-muted-foreground mb-4">
                Showcase your favorite plushies here! This feature will be available soon.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showEditProfile && (
        <EditProfileModal
          currentProfile={userProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {showCustomization && (
        <ProfileCustomizationModal
          currentBackground={selectedBackground}
          currentTags={favoriteTags}
          onSave={(background, tags) => {
            setSelectedBackground(background);
            setFavoriteTags(tags);
            setShowCustomization(false);
          }}
          onClose={() => setShowCustomization(false)}
        />
      )}
    </>
  );
}
