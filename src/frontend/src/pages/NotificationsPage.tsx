import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, UserPlus, CheckCheck, Bell } from 'lucide-react';
import { NotificationType } from '../backend';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { identity } = useInternetIdentity();
  const { data: notifications, isLoading } = useGetAllNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to view your notifications</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async (type?: NotificationType) => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.like:
        return <Heart className="h-5 w-5 text-pink-500" />;
      case NotificationType.comment:
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case NotificationType.follow:
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
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

  const groupedNotifications = {
    likes: notifications?.filter((n) => n.notificationType === NotificationType.like) || [],
    comments: notifications?.filter((n) => n.notificationType === NotificationType.comment) || [],
    follows: notifications?.filter((n) => n.notificationType === NotificationType.follow) || [],
  };

  const unreadLikes = groupedNotifications.likes.filter((n) => !n.isRead).length;
  const unreadComments = groupedNotifications.comments.filter((n) => !n.isRead).length;
  const unreadFollows = groupedNotifications.follows.filter((n) => !n.isRead).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Notifications Center
            </h1>
            <p className="text-muted-foreground mt-1">Stay updated with all your interactions</p>
          </div>
          <img
            src="/assets/generated/notification-bell-icon-transparent.dim_64x64.png"
            alt="Notifications"
            className="h-16 w-16 opacity-80"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              When someone likes or comments on your posts, you'll see it here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Likes Section */}
          {groupedNotifications.likes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-pink-500" />
                    <div>
                      <CardTitle>Likes</CardTitle>
                      <CardDescription>
                        {unreadLikes > 0 ? `${unreadLikes} new` : 'All caught up'}
                      </CardDescription>
                    </div>
                  </div>
                  {unreadLikes > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAllAsRead(NotificationType.like)}
                      className="gap-2"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark all as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupedNotifications.likes.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      notification.isRead ? 'bg-muted/30' : 'bg-pink-50 dark:bg-pink-950/20'
                    }`}
                  >
                    <div className="mt-1">{getNotificationIcon(notification.notificationType)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="shrink-0"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          {groupedNotifications.comments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-purple-500" />
                    <div>
                      <CardTitle>Comments</CardTitle>
                      <CardDescription>
                        {unreadComments > 0 ? `${unreadComments} new` : 'All caught up'}
                      </CardDescription>
                    </div>
                  </div>
                  {unreadComments > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAllAsRead(NotificationType.comment)}
                      className="gap-2"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark all as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupedNotifications.comments.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      notification.isRead ? 'bg-muted/30' : 'bg-purple-50 dark:bg-purple-950/20'
                    }`}
                  >
                    <div className="mt-1">{getNotificationIcon(notification.notificationType)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="shrink-0"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Follows Section */}
          {groupedNotifications.follows.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-6 w-6 text-blue-500" />
                    <div>
                      <CardTitle>Follows</CardTitle>
                      <CardDescription>
                        {unreadFollows > 0 ? `${unreadFollows} new` : 'All caught up'}
                      </CardDescription>
                    </div>
                  </div>
                  {unreadFollows > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAllAsRead(NotificationType.follow)}
                      className="gap-2"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark all as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupedNotifications.follows.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      notification.isRead ? 'bg-muted/30' : 'bg-blue-50 dark:bg-blue-950/20'
                    }`}
                  >
                    <div className="mt-1">{getNotificationIcon(notification.notificationType)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="shrink-0"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
