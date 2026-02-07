import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetUnreadNotificationCount } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, LogOut, User, Edit, Home, Users, Image, BookOpen, MessageSquare, Calendar, Menu, ShoppingBag, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import EditProfileModal from './EditProfileModal';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: unreadCount } = useGetUnreadNotificationCount();
  const queryClient = useQueryClient();
  const router = useRouter();
  const routerState = useRouterState();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const currentPath = routerState.location.pathname;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
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

  const navigate = (path: string) => {
    router.navigate({ to: path });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/collections', label: 'Collections', icon: Image },
    { path: '/discussions', label: 'Discussions', icon: MessageSquare },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/events', label: 'Events', icon: Calendar },
  ];

  const unreadCountNumber = unreadCount ? Number(unreadCount) : 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-pink-200/50 bg-white/80 backdrop-blur-md dark:border-purple-800/50 dark:bg-gray-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/assets/generated/logo.dim_200x200.png" alt="Plushie Haven" className="h-10 w-10 rounded-full" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Plushie Haven
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">A cozy community for plushie lovers</p>
              </div>
            </div>

            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => navigate(item.path)}
                      className="rounded-full gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/notifications')}
                  className="relative rounded-full"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCountNumber > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                    >
                      {unreadCountNumber > 9 ? '9+' : unreadCountNumber}
                    </Badge>
                  )}
                </Button>

                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64">
                    <SheetHeader>
                      <SheetTitle className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        Navigation
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="mt-6 flex flex-col gap-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                        return (
                          <Button
                            key={item.path}
                            variant={isActive ? 'secondary' : 'ghost'}
                            onClick={() => navigate(item.path)}
                            className="justify-start gap-3 rounded-full"
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Button>
                        );
                      })}
                      <Button
                        variant={currentPath === '/notifications' ? 'secondary' : 'ghost'}
                        onClick={() => navigate('/notifications')}
                        className="justify-start gap-3 rounded-full relative"
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                        {unreadCountNumber > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {unreadCountNumber > 9 ? '9+' : unreadCountNumber}
                          </Badge>
                        )}
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </>
            )}

            {isAuthenticated && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-pink-300">
                      <AvatarImage src="" alt={userProfile.username} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                        {getInitials(userProfile.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile.username}</p>
                      {userProfile.bio && (
                        <p className="text-xs leading-none text-muted-foreground line-clamp-2">{userProfile.bio}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEditProfile(true)} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAuth} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleAuth}
                disabled={disabled}
                className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium shadow-lg"
              >
                {disabled ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Join the Haven</span>
                    <span className="sm:hidden">Join</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>
      {showEditProfile && userProfile && (
        <EditProfileModal
          currentProfile={userProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
}
