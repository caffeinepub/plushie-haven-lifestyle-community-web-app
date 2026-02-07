import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Timestamp = bigint;
export interface DiscussionComment {
    id: string;
    content: string;
    author: Principal;
    timestamp: Timestamp;
    postId: string;
}
export interface CreateCommentInput {
    content: string;
    postId: string;
}
export interface CreateResourceInput {
    title: string;
    content: string;
}
export interface CreatePostInput {
    caption: string;
    image: ExternalBlob;
}
export interface DiscussionPost {
    id: string;
    topic: string;
    content: string;
    author: Principal;
    timestamp: Timestamp;
    image?: ExternalBlob;
}
export interface PlushiePost {
    id: string;
    author: Principal;
    timestamp: Timestamp;
    caption: string;
    image: ExternalBlob;
}
export interface EmojiReactions {
    count: bigint;
    emoji: string;
}
export interface CreateGroupPostInput {
    content: string;
    groupId: string;
    image?: ExternalBlob;
}
export interface CreateEventCommentInput {
    content: string;
    postId: string;
}
export type PostReactions = Array<EmojiReactions>;
export interface EventPost {
    id: string;
    title: string;
    createdBy: Principal;
    description: string;
    timestamp: Timestamp;
    image?: ExternalBlob;
}
export interface CreateDiscussionCommentInput {
    content: string;
    postId: string;
}
export interface CollectionPost {
    id: string;
    author: Principal;
    timestamp: Timestamp;
    caption: string;
    image: ExternalBlob;
}
export interface EventComment {
    id: string;
    content: string;
    author: Principal;
    timestamp: Timestamp;
    postId: string;
}
export interface CreateCollectionInput {
    caption: string;
    image: ExternalBlob;
}
export interface Comment {
    id: string;
    content: string;
    author: Principal;
    timestamp: Timestamp;
    postId: string;
}
export interface GroupComment {
    id: string;
    content: string;
    author: Principal;
    timestamp: Timestamp;
    postId: string;
}
export type EmojiId = string;
export interface CreateEventInput {
    title: string;
    description: string;
    image?: ExternalBlob;
}
export interface CreateGroupCommentInput {
    content: string;
    postId: string;
}
export interface CreateCollectionCommentInput {
    content: string;
    postId: string;
}
export interface Notification {
    id: string;
    notificationType: NotificationType;
    recipient: Principal;
    referenceId: string;
    isRead: boolean;
    message: string;
    timestamp: Timestamp;
}
export interface GroupPost {
    id: string;
    content: string;
    author: Principal;
    groupId: string;
    timestamp: Timestamp;
    image?: ExternalBlob;
}
export interface Resource {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
    createdBy: Principal;
}
export interface CreateDiscussionInput {
    topic: string;
    content: string;
    image?: ExternalBlob;
}
export interface CollectionComment {
    id: string;
    content: string;
    author: Principal;
    timestamp: Timestamp;
    postId: string;
}
export interface UserProfile {
    bio: string;
    username: string;
}
export enum NotificationType {
    like = "like",
    comment = "comment",
    follow = "follow"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCollectionComment(input: CreateCollectionCommentInput): Promise<string>;
    createCollectionPost(input: CreateCollectionInput): Promise<string>;
    createComment(input: CreateCommentInput): Promise<string>;
    createDiscussionComment(input: CreateDiscussionCommentInput): Promise<string>;
    createDiscussionPost(input: CreateDiscussionInput): Promise<string>;
    createEvent(input: CreateEventInput): Promise<string>;
    createEventComment(input: CreateEventCommentInput): Promise<string>;
    createGroup(groupName: string, groupDescription: string): Promise<string>;
    createGroupComment(input: CreateGroupCommentInput): Promise<string>;
    createGroupPost(input: CreateGroupPostInput): Promise<string>;
    createPost(input: CreatePostInput): Promise<string>;
    createResource(input: CreateResourceInput): Promise<string>;
    deleteGroup(groupId: string): Promise<void>;
    getAllCollectionPosts(): Promise<Array<CollectionPost>>;
    getAllCommunityGroups(): Promise<Array<[string, string, string, Principal, Timestamp, Array<Principal>]>>;
    getAllDiscussionPosts(topic: string): Promise<Array<DiscussionPost>>;
    getAllEvents(): Promise<Array<EventPost>>;
    getAllNotifications(): Promise<Array<Notification>>;
    getAllPostReactions(): Promise<Array<[string, PostReactions]>>;
    getAllPosts(): Promise<Array<PlushiePost>>;
    getAllResources(): Promise<Array<Resource>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCollectionComments(postId: string): Promise<Array<CollectionComment>>;
    getCollectionLikeCount(postId: string): Promise<bigint>;
    getCommentsForPost(postId: string): Promise<Array<Comment>>;
    getDiscussionComments(postId: string): Promise<Array<DiscussionComment>>;
    getDiscussionLikeCount(postId: string): Promise<bigint>;
    getEventComments(postId: string): Promise<Array<EventComment>>;
    getGroupComments(postId: string): Promise<Array<GroupComment>>;
    getGroupFeed(groupId: string): Promise<Array<GroupPost>>;
    getGroupMembers(groupId: string): Promise<Array<Principal>>;
    getLikeCount(postId: string): Promise<bigint>;
    getPostsByUser(user: Principal): Promise<Array<PlushiePost>>;
    getReactions(postId: string): Promise<PostReactions>;
    getResource(resourceId: string): Promise<Resource | null>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasUserLiked(postId: string): Promise<boolean>;
    hasUserLikedCollection(postId: string): Promise<boolean>;
    hasUserLikedDiscussion(postId: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isUserGroupMember(groupId: string): Promise<boolean>;
    joinGroup(groupId: string): Promise<void>;
    leaveGroup(groupId: string): Promise<void>;
    listGroupPosts(groupId: string): Promise<Array<GroupPost>>;
    markAllNotificationsAsRead(): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    removeUserFromGroup(groupId: string, user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchEvents(searchTerm: string): Promise<Array<EventPost>>;
    searchGroups(searchTerm: string): Promise<Array<[string, string, string, Principal, Timestamp, Array<Principal>]>>;
    searchPosts(searchTerm: string): Promise<Array<PlushiePost>>;
    toggleCollectionLike(postId: string): Promise<void>;
    toggleDiscussionLike(postId: string): Promise<void>;
    toggleEmojiReaction(postId: string, emojiId: EmojiId): Promise<PostReactions>;
    toggleLike(postId: string): Promise<void>;
}
