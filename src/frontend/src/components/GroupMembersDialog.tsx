import { useState } from 'react';
import { useGetGroupMembers, useGetUserProfile, useRemoveUserFromGroup } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserMinus, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';

interface GroupMembersDialogProps {
  groupId: string;
  isAdmin: boolean;
}

export default function GroupMembersDialog({ groupId, isAdmin }: GroupMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: members = [], isLoading } = useGetGroupMembers(groupId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full gap-2 text-sm">
          <Users className="h-4 w-4" />
          View Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members
            {isAdmin && (
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </>
            ) : members.length > 0 ? (
              members.map((member) => (
                <MemberItem key={member.toString()} member={member} groupId={groupId} isAdmin={isAdmin} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No members found</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface MemberItemProps {
  member: Principal;
  groupId: string;
  isAdmin: boolean;
}

function MemberItem({ member, groupId, isAdmin }: MemberItemProps) {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile(member.toString());
  const removeUser = useRemoveUserFromGroup();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const isCurrentUser = identity && member.toString() === identity.getPrincipal().toString();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemove = async () => {
    try {
      await removeUser.mutateAsync({ groupId, user: member });
      toast.success('Member removed successfully');
      setShowRemoveDialog(false);
    } catch (error: any) {
      console.error('Remove member error:', error);
      if (error.message?.includes('Cannot remove the group creator')) {
        toast.error('Cannot remove the group creator');
      } else {
        toast.error('Failed to remove member. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 border-2 border-pink-300">
            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white text-sm">
              {profile ? getInitials(profile.username) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {profile?.username || 'Anonymous'}
              {isCurrentUser && <span className="text-muted-foreground ml-2">(You)</span>}
            </p>
            {profile?.bio && (
              <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>
            )}
          </div>
        </div>
        {isAdmin && !isCurrentUser && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowRemoveDialog(true)}
            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Remove member"
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {profile?.username || 'this member'} from the group? They will need to rejoin to access the group again.
              <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                You are removing this member as an admin.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeUser.isPending ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
