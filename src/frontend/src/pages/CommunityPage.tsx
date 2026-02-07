import { useState } from 'react';
import { useGetAllCommunityGroups, useCreateGroup, useJoinGroup, useIsUserGroupMember, useDeleteGroup, useIsCallerAdmin } from '../hooks/useQueries';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Plus, UserPlus, Check, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunityPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  
  const { data: groups = [], isLoading } = useGetAllCommunityGroups();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();

  const filteredGroups = groups.filter(
    ([id, name, description]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (!groupDescription.trim()) {
      toast.error('Please enter a group description');
      return;
    }

    try {
      await createGroup.mutateAsync({ name: groupName.trim(), description: groupDescription.trim() });
      toast.success('Group created successfully! 🎉');
      setGroupName('');
      setGroupDescription('');
      setShowCreateDialog(false);
    } catch (error: any) {
      console.error('Create group error:', error);
      if (error.message?.includes('already exists')) {
        toast.error('A group with this name already exists');
      } else {
        toast.error('Failed to create group. Please try again.');
      }
    }
  };

  const handleJoinGroup = async (groupId: string, groupName: string) => {
    try {
      await joinGroup.mutateAsync(groupId);
      toast.success(`Joined ${groupName}! 🎉`);
    } catch (error: any) {
      console.error('Join group error:', error);
      toast.error('Failed to join group. Please try again.');
    }
  };

  const navigateToGroup = (groupId: string) => {
    router.navigate({ to: `/community/${groupId}` });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800">
          <Users className="h-10 w-10 text-pink-600 dark:text-pink-300" />
        </div>
        <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Community Groups
        </h2>
        <p className="text-muted-foreground">
          Join groups to connect with plushie enthusiasts who share your interests
        </p>
        {isAdmin && (
          <Badge variant="secondary" className="mt-3 gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        )}
      </div>

      {/* Search and Create */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium gap-2">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Create a New Group
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  placeholder="e.g., Vintage Plushies"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={100}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupDescription">Description *</Label>
                <Textarea
                  id="groupDescription"
                  placeholder="Tell us about this group..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="rounded-2xl resize-none"
                />
                <p className="text-xs text-muted-foreground">{groupDescription.length}/500 characters</p>
              </div>
              <Button
                type="submit"
                disabled={createGroup.isPending || !groupName.trim() || !groupDescription.trim()}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-medium"
              >
                {createGroup.isPending ? 'Creating...' : 'Create Group'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-3xl">
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map(([id, name, description, creator, createdAt, members]) => (
            <GroupCard
              key={id}
              id={id}
              name={name}
              description={description}
              creator={creator}
              memberCount={members.length}
              isAdmin={isAdmin}
              onJoin={handleJoinGroup}
              onNavigate={navigateToGroup}
            />
          ))
        ) : (
          <Card className="rounded-3xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
              <Users className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              {searchTerm ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'Try a different search term'
                : 'Be the first to create a community group!'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

interface GroupCardProps {
  id: string;
  name: string;
  description: string;
  creator: any;
  memberCount: number;
  isAdmin: boolean;
  onJoin: (id: string, name: string) => void;
  onNavigate: (id: string) => void;
}

function GroupCard({ id, name, description, creator, memberCount, isAdmin, onJoin, onNavigate }: GroupCardProps) {
  const { identity } = useInternetIdentity();
  const { data: isMember = false, isLoading } = useIsUserGroupMember(id);
  const joinGroup = useJoinGroup();
  const deleteGroup = useDeleteGroup();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isCreator = identity && creator.toString() === identity.getPrincipal().toString();
  const canDelete = isCreator || isAdmin;

  const handleDelete = async () => {
    try {
      await deleteGroup.mutateAsync(id);
      toast.success('Group deleted successfully');
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Delete group error:', error);
      toast.error('Failed to delete group. Please try again.');
    }
  };

  return (
    <>
      <Card className="rounded-3xl hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate(id)}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {name}
              </CardTitle>
              <CardDescription className="line-clamp-2">{description}</CardDescription>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  title={isAdmin && !isCreator ? 'Delete as Admin' : 'Delete Group'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {isLoading ? (
                <Button size="sm" disabled className="rounded-full">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </Button>
              ) : isMember ? (
                <Button size="sm" variant="secondary" className="rounded-full gap-2" disabled>
                  <Check className="h-4 w-4" />
                  Joined
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white gap-2"
                  disabled={joinGroup.isPending}
                  onClick={() => onJoin(id, name)}
                >
                  <UserPlus className="h-4 w-4" />
                  Join
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This will permanently delete the group and all its posts and comments. This action cannot be undone.
              {isAdmin && !isCreator && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  You are deleting this group as an admin.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGroup.isPending ? 'Deleting...' : 'Delete Group'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
