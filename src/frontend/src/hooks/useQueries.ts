import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { 
  PlushiePost, 
  Comment, 
  UserProfile, 
  CreatePostInput, 
  CreateCommentInput, 
  GroupPost, 
  GroupComment, 
  CreateGroupPostInput, 
  CreateGroupCommentInput,
  CollectionPost,
  CollectionComment,
  CreateCollectionInput,
  CreateCollectionCommentInput,
  DiscussionPost,
  DiscussionComment,
  CreateDiscussionInput,
  CreateDiscussionCommentInput,
  EventPost,
  EventComment,
  CreateEventCommentInput,
  Notification,
  PostReactions,
  EmojiId,
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(user: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user],
    queryFn: async () => {
      if (!actor) return null;
      const principal = { toString: () => user } as any;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Notification Queries
export function useGetAllNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

export function useGetUnreadNotificationCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// Post Queries
export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<PlushiePost[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useGetPostsByUser(user: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PlushiePost[]>({
    queryKey: ['posts', 'user', user],
    queryFn: async () => {
      if (!actor) return [];
      const principal = { toString: () => user } as any;
      return actor.getPostsByUser(principal);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// Emoji Reaction Queries
export function useGetReactions(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PostReactions>({
    queryKey: ['reactions', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReactions(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useToggleEmojiReaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, emojiId }: { postId: string; emojiId: EmojiId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleEmojiReaction(postId, emojiId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// Like Queries
export function useGetLikeCount(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['likes', postId],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getLikeCount(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useHasUserLiked(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasLiked', postId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasUserLiked(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useToggleLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleLike(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likes', postId] });
      queryClient.invalidateQueries({ queryKey: ['hasLiked', postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// Comment Queries
export function useGetCommentsForPost(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsForPost(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createComment(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// Community Group Queries
export function useGetAllCommunityGroups() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, string, string, Principal, bigint, Array<Principal>]>>({
    queryKey: ['communityGroups'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCommunityGroups();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGroup(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
    },
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinGroup(groupId);
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['groupMembership', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupDetails', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    },
  });
}

export function useLeaveGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.leaveGroup(groupId);
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['groupMembership', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupDetails', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupPosts', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    },
  });
}

export function useDeleteGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
    },
  });
}

export function useRemoveUserFromGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, user }: { groupId: string; user: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeUserFromGroup(groupId, user);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupDetails', variables.groupId] });
    },
  });
}

export function useIsUserGroupMember(groupId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['groupMembership', groupId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isUserGroupMember(groupId);
    },
    enabled: !!actor && !isFetching && !!groupId,
  });
}

export function useGetGroupDetails(groupId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<{ name: string; description: string; memberCount: number; creator: Principal } | null>({
    queryKey: ['groupDetails', groupId],
    queryFn: async () => {
      if (!actor) return null;
      const groups = await actor.getAllCommunityGroups();
      const group = groups.find(([id]) => id === groupId);
      if (!group) return null;
      return {
        name: group[1],
        description: group[2],
        creator: group[3],
        memberCount: group[5].length,
      };
    },
    enabled: !!actor && !isFetching && !!groupId,
  });
}

export function useGetGroupMembers(groupId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<Principal>>({
    queryKey: ['groupMembers', groupId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroupMembers(groupId);
    },
    enabled: !!actor && !isFetching && !!groupId,
  });
}

// Group Post Queries
export function useGetGroupPosts(groupId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<GroupPost[]>({
    queryKey: ['groupPosts', groupId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listGroupPosts(groupId);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized') || error.message?.includes('Only group members')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!groupId,
    retry: false,
  });
}

export function useCreateGroupPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGroupPostInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGroupPost(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupPosts', variables.groupId] });
    },
  });
}

// Group Comment Queries
export function useGetGroupComments(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<GroupComment[]>({
    queryKey: ['groupComments', postId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getGroupComments(postId);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized') || error.message?.includes('Only group members')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!postId,
    retry: false,
  });
}

export function useCreateGroupComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGroupCommentInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGroupComment(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupComments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// Collection Queries
export function useGetAllCollectionPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<CollectionPost[]>({
    queryKey: ['collectionPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCollectionPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCollectionPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCollectionInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCollectionPost(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionPosts'] });
    },
  });
}

export function useGetCollectionComments(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CollectionComment[]>({
    queryKey: ['collectionComments', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCollectionComments(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useCreateCollectionComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCollectionCommentInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCollectionComment(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collectionComments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useGetCollectionLikeCount(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['collectionLikes', postId],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getCollectionLikeCount(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useHasUserLikedCollection(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasLikedCollection', postId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasUserLikedCollection(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useToggleCollectionLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleCollectionLike(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['collectionLikes', postId] });
      queryClient.invalidateQueries({ queryKey: ['hasLikedCollection', postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// Discussion Queries
export function useGetAllDiscussionPosts(topic: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DiscussionPost[]>({
    queryKey: ['discussionPosts', topic],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDiscussionPosts(topic);
    },
    enabled: !!actor && !isFetching && !!topic,
  });
}

export function useCreateDiscussionPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiscussionInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDiscussionPost(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discussionPosts', variables.topic] });
    },
  });
}

export function useGetDiscussionComments(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DiscussionComment[]>({
    queryKey: ['discussionComments', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDiscussionComments(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useCreateDiscussionComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiscussionCommentInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDiscussionComment(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discussionComments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useGetDiscussionLikeCount(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['discussionLikes', postId],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getDiscussionLikeCount(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useHasUserLikedDiscussion(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasLikedDiscussion', postId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasUserLikedDiscussion(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useToggleDiscussionLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleDiscussionLike(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['discussionLikes', postId] });
      queryClient.invalidateQueries({ queryKey: ['hasLikedDiscussion', postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// Event Queries
export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<EventPost[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEventComments(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<EventComment[]>({
    queryKey: ['eventComments', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEventComments(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useCreateEventComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventCommentInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEventComment(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventComments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}
