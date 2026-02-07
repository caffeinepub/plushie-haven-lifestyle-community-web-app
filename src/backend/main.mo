import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Timestamp = Int;

  let posts = Map.empty<Text, PlushiePost>();
  let comments = Map.empty<Text, Comment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let likes = Map.empty<Text, Set.Set<Principal>>();
  let groups = Map.empty<Text, Group>();
  let groupPosts = Map.empty<Text, GroupPost>();
  let groupComments = Map.empty<Text, GroupComment>();
  let collections = Map.empty<Text, CollectionPost>();
  let events = Map.empty<Text, EventPost>();
  let discussions = Map.empty<Text, DiscussionPost>();
  let resources = Map.empty<Text, Resource>();
  let discussionComments = Map.empty<Text, DiscussionComment>();
  let discussionLikes = Map.empty<Text, Set.Set<Principal>>();
  let collectionComments = Map.empty<Text, CollectionComment>();
  let collectionLikes = Map.empty<Text, Set.Set<Principal>>();
  let eventComments = Map.empty<Text, EventComment>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  let emojiReactions = Map.empty<Text, Map.Map<Text, Set.Set<Principal>>>();

  type NotificationType = {
    #like;
    #comment;
    #follow;
  };

  type Notification = {
    id : Text;
    recipient : Principal;
    notificationType : NotificationType;
    referenceId : Text;
    message : Text;
    isRead : Bool;
    timestamp : Timestamp;
  };

  module Notification {
    public func compareByTimestamp(n1 : Notification, n2 : Notification) : Order.Order {
      Int.compare(n2.timestamp, n1.timestamp);
    };
  };

  type NotificationInput = {
    recipient : Principal;
    notificationType : NotificationType;
    referenceId : Text;
    message : Text;
  };

  // Private helper function to create notifications internally
  private func createNotificationInternal(input : NotificationInput) : () {
    let notification : Notification = {
      id = Time.now().toText();
      recipient = input.recipient;
      notificationType = input.notificationType;
      referenceId = input.referenceId;
      message = input.message;
      isRead = false;
      timestamp = Time.now();
    };

    let existingNotifications : List.List<Notification> = switch (notifications.get(input.recipient)) {
      case (null) { List.empty<Notification>() };
      case (?list) { list };
    };

    existingNotifications.add(notification);
    notifications.add(input.recipient, existingNotifications);
  };

  // Notification Center Functions
  public query ({ caller }) func getAllNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?userNotifications) {
        userNotifications.toArray().sort(Notification.compareByTimestamp);
      };
    };
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };

    func updateNotificationList(list : List.List<Notification>) : List.List<Notification> {
      list.map<Notification, Notification>(
        func(n) {
          if (n.id == notificationId and n.recipient == caller) {
            { n with isRead = true };
          } else {
            n;
          };
        }
      );
    };

    let notificationsToUpdate = switch (notifications.get(caller)) {
      case (null) { List.empty<Notification>() };
      case (?l) { updateNotificationList(l) };
    };

    notifications.add(caller, notificationsToUpdate);
  };

  public shared ({ caller }) func markAllNotificationsAsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark all notifications");
    };

    func updateNotificationList(list : List.List<Notification>) : List.List<Notification> {
      list.map<Notification, Notification>(
        func(n) { { n with isRead = true } }
      );
    };

    let notificationsToUpdate = switch (notifications.get(caller)) {
      case (null) { List.empty<Notification>() };
      case (?l) { updateNotificationList(l) };
    };

    notifications.add(caller, notificationsToUpdate);
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notification count");
    };

    switch (notifications.get(caller)) {
      case (null) { 0 };
      case (?userNotifications) {
        userNotifications.toArray().filter(func(n) { not n.isRead }).size();
      };
    };
  };

  // CRUD operations for plushie posts, comments, groups, collections, resources, discussions, events, etc.

  // Plushie Post
  type PlushiePost = {
    id : Text;
    author : Principal;
    image : Storage.ExternalBlob;
    caption : Text;
    timestamp : Timestamp;
  };
  module PlushiePost {
    public func compareByTimestamp(p1 : PlushiePost, p2 : PlushiePost) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp);
    };
  };

  type Comment = {
    id : Text;
    postId : Text;
    author : Principal;
    content : Text;
    timestamp : Timestamp;
  };
  module Comment {
    public func compareByTimestamp(c1 : Comment, c2 : Comment) : Order.Order {
      Int.compare(c2.timestamp, c1.timestamp);
    };
  };

  type UserProfile = {
    username : Text;
    bio : Text;
  };

  type CreatePostInput = {
    image : Storage.ExternalBlob;
    caption : Text;
  };

  type CreateCommentInput = {
    postId : Text;
    content : Text;
  };

  type Group = {
    id : Text;
    name : Text;
    description : Text;
    creator : Principal;
    createdAt : Timestamp;
    members : Set.Set<Principal>;
  };
  module Group {
    public func compareByTimestamp(g1 : Group, g2 : Group) : Order.Order {
      Int.compare(g2.createdAt, g1.createdAt);
    };
  };

  type GroupPost = {
    id : Text;
    groupId : Text;
    author : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Timestamp;
  };
  module GroupPost {
    public func compareByTimestamp(p1 : GroupPost, p2 : GroupPost) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp);
    };
  };

  type GroupComment = {
    id : Text;
    postId : Text;
    author : Principal;
    content : Text;
    timestamp : Timestamp;
  };
  module GroupComment {
    public func compareByTimestamp(c1 : GroupComment, c2 : GroupComment) : Order.Order {
      Int.compare(c2.timestamp, c1.timestamp);
    };
  };

  type CreateGroupPostInput = {
    groupId : Text;
    content : Text;
    image : ?Storage.ExternalBlob;
  };

  type CreateGroupCommentInput = {
    postId : Text;
    content : Text;
  };

  type CollectionPost = {
    id : Text;
    author : Principal;
    image : Storage.ExternalBlob;
    caption : Text;
    timestamp : Timestamp;
  };
  module CollectionPost {
    public func compareByTimestamp(c1 : CollectionPost, c2 : CollectionPost) : Order.Order {
      Int.compare(c2.timestamp, c1.timestamp);
    };
  };

  type CollectionComment = {
    id : Text;
    postId : Text;
    author : Principal;
    content : Text;
    timestamp : Timestamp;
  };
  module CollectionComment {
    public func compareByTimestamp(c1 : CollectionComment, c2 : CollectionComment) : Order.Order {
      Int.compare(c2.timestamp, c1.timestamp);
    };
  };

  type CreateCollectionInput = {
    image : Storage.ExternalBlob;
    caption : Text;
  };

  type CreateCollectionCommentInput = {
    postId : Text;
    content : Text;
  };

  type Resource = {
    id : Text;
    title : Text;
    content : Text;
    createdBy : Principal;
    createdAt : Timestamp;
  };

  type CreateResourceInput = {
    title : Text;
    content : Text;
  };

  type DiscussionPost = {
    id : Text;
    author : Principal;
    topic : Text;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Timestamp;
  };
  module DiscussionPost {
    public func compareByTimestamp(d1 : DiscussionPost, d2 : DiscussionPost) : Order.Order {
      Int.compare(d2.timestamp, d1.timestamp);
    };
  };

  type DiscussionComment = {
    id : Text;
    postId : Text;
    author : Principal;
    content : Text;
    timestamp : Timestamp;
  };
  module DiscussionComment {
    public func compareByTimestamp(d1 : DiscussionComment, d2 : DiscussionComment) : Order.Order {
      Int.compare(d2.timestamp, d1.timestamp);
    };
  };

  type CreateDiscussionInput = {
    topic : Text;
    content : Text;
    image : ?Storage.ExternalBlob;
  };

  type CreateDiscussionCommentInput = {
    postId : Text;
    content : Text;
  };

  type EventPost = {
    id : Text;
    title : Text;
    description : Text;
    createdBy : Principal;
    image : ?Storage.ExternalBlob;
    timestamp : Timestamp;
  };
  module EventPost {
    public func compareByTimestamp(e1 : EventPost, e2 : EventPost) : Order.Order {
      Int.compare(e2.timestamp, e1.timestamp);
    };
  };

  type EventComment = {
    id : Text;
    postId : Text;
    author : Principal;
    content : Text;
    timestamp : Timestamp;
  };
  module EventComment {
    public func compareByTimestamp(e1 : EventComment, e2 : EventComment) : Order.Order {
      Int.compare(e2.timestamp, e1.timestamp);
    };
  };

  type CreateEventInput = {
    title : Text;
    description : Text;
    image : ?Storage.ExternalBlob;
  };

  type CreateEventCommentInput = {
    postId : Text;
    content : Text;
  };

  type EmojiId = Text;
  type EmojiReactions = {
    emoji : Text;
    count : Nat;
  };

  type ReactionCounts = {
    likes : Nat;
    dislikes : Nat;
    hearts : Nat;
    smilingFaces : Nat;
    surprisedFaces : Nat;
  };

  type PostReactions = [EmojiReactions];

  let validEmojis = ["like", "dislike", "heart", "smiling_face", "surprised_face"];

  private func isGroupMember(groupId : Text, user : Principal) : Bool {
    switch (groups.get(groupId)) {
      case (null) { false };
      case (?group) { group.members.contains(user) };
    };
  };

  public shared ({ caller }) func createPost(input : CreatePostInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let postId = Time.now().toText();
    let post : PlushiePost = {
      id = postId;
      author = caller;
      image = input.image;
      caption = input.caption;
      timestamp = Time.now();
    };

    posts.add(postId, post);
    postId;
  };

  public query ({ caller }) func getAllPosts() : async [PlushiePost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view the feed");
    };
    posts.values().toArray().sort(PlushiePost.compareByTimestamp);
  };

  public query ({ caller }) func getAllPostReactions() : async [(Text, PostReactions)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can see reactions");
    };

    emojiReactions.toArray().map(
      func((postId, reactionMap)) {
        let reactionsList = reactionMap.toArray().map(
          func((emojiId, usersSet)) {
            {
              emoji = emojiId;
              count = usersSet.size();
            };
          }
        );
        (postId, reactionsList);
      }
    );
  };

  func containsEmojiId(emojiId : EmojiId) : Bool {
    for (emoji in validEmojis.values()) {
      if (emoji == emojiId) { return true };
    };
    false;
  };

  public shared ({ caller }) func toggleEmojiReaction(postId : Text, emojiId : EmojiId) : async PostReactions {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can react to posts with emojis");
    };

    if (not containsEmojiId(emojiId)) {
      Runtime.trap("Unsupported emojiId: " # emojiId # ". Available emojis: " # ("like,dislike,heart,smiling_face,surprised_face"));
    };

    let postExists = posts.containsKey(postId) or collections.containsKey(postId) or discussions.containsKey(postId);
    if (not postExists) {
      Runtime.trap("Post not found");
    };

    let postReactions = switch (emojiReactions.get(postId)) {
      case (null) {
        let newReactionMap = Map.empty<Text, Set.Set<Principal>>();
        let userSet = Set.singleton(caller);
        newReactionMap.add(emojiId, userSet);
        newReactionMap;
      };
      case (?reactionMap) {
        let userSet = switch (reactionMap.get(emojiId)) {
          case (null) { Set.singleton(caller) };
          case (?users) {
            if (users.contains(caller)) {
              users.remove(caller);
              users;
            } else {
              users.add(caller);
              users;
            };
          };
        };
        reactionMap.add(emojiId, userSet);
        reactionMap;
      };
    };

    emojiReactions.add(postId, postReactions);

    // Create notification for post author
    switch (posts.get(postId)) {
      case (null) {};
      case (?post) {
        if (post.author != caller) {
          let username = switch (userProfiles.get(caller)) {
            case (null) { caller.toText() };
            case (?profile) { profile.username };
          };
          createNotificationInternal({
            recipient = post.author;
            notificationType = #like;
            referenceId = postId;
            message = username # " reacted to your post with " # emojiId;
          });
        };
      };
    };

    // Convert updated reactions to PostReactions type.
    let reactionsList = postReactions.toArray().map(
      func((emoji, usersSet)) {
        {
          emoji;
          count = usersSet.size();
        };
      }
    );
    reactionsList;
  };

  public query ({ caller }) func getReactions(postId : Text) : async PostReactions {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reactions");
    };

    switch (emojiReactions.get(postId)) {
      case (null) { [] };
      case (?reactionMap) {
        reactionMap.toArray().map(
          func((emoji, usersSet)) {
            {
              emoji;
              count = usersSet.size();
            };
          }
        );
      };
    };
  };

  public shared ({ caller }) func createComment(input : CreateCommentInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create comments");
    };

    let commentId = Time.now().toText();
    let comment : Comment = {
      id = commentId;
      postId = input.postId;
      author = caller;
      content = input.content;
      timestamp = Time.now();
    };

    comments.add(commentId, comment);

    // Create notification for post author
    switch (posts.get(input.postId)) {
      case (null) {};
      case (?post) {
        if (post.author != caller) {
          let username = switch (userProfiles.get(caller)) {
            case (null) { caller.toText() };
            case (?profile) { profile.username };
          };
          createNotificationInternal({
            recipient = post.author;
            notificationType = #comment;
            referenceId = input.postId;
            message = username # " commented on your post";
          });
        };
      };
    };

    commentId;
  };

  public query ({ caller }) func getCommentsForPost(postId : Text) : async [Comment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };
    comments.values().toArray().filter(func(c) { c.postId == postId }).sort(Comment.compareByTimestamp);
  };

  public shared ({ caller }) func toggleLike(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    let alreadyLiked = switch (likes.get(postId)) {
      case (null) { false };
      case (?s) { s.contains(caller) };
    };

    if (alreadyLiked) {
      switch (likes.get(postId)) {
        case (null) {};
        case (?s) {
          s.remove(caller);
          if (s.isEmpty()) {
            likes.remove(postId);
          };
        };
      };
    } else {
      switch (likes.get(postId)) {
        case (null) {
          let s = Set.singleton(caller);
          likes.add(postId, s);
        };
        case (?s) { s.add(caller) };
      };

      // Create notification for post author when liked
      switch (posts.get(postId)) {
        case (null) {};
        case (?post) {
          if (post.author != caller) {
            let username = switch (userProfiles.get(caller)) {
              case (null) { caller.toText() };
              case (?profile) { profile.username };
            };
            createNotificationInternal({
              recipient = post.author;
              notificationType = #like;
              referenceId = postId;
              message = username # " liked your post";
            });
          };
        };
      };
    };
  };

  public query ({ caller }) func getLikeCount(postId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view like counts");
    };
    switch (likes.get(postId)) {
      case (null) { 0 };
      case (?l) { l.size() };
    };
  };

  public query ({ caller }) func hasUserLiked(postId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check like status");
    };
    switch (likes.get(postId)) {
      case (null) { false };
      case (?l) { l.contains(caller) };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [PlushiePost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user collections");
    };
    let userPosts = posts.values().toArray().filter(func(p) { p.author == user });
    userPosts.sort(PlushiePost.compareByTimestamp);
  };

  public query ({ caller }) func searchPosts(searchTerm : Text) : async [PlushiePost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search posts");
    };
    posts.values().toArray().filter(
      func(p) { p.caption.contains(#text searchTerm) });
  };

  //
  // Community Group Operations
  //

  public shared ({ caller }) func createGroupPost(input : CreateGroupPostInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    if (not isGroupMember(input.groupId, caller)) {
      Runtime.trap("Unauthorized: Only group members can post in this group");
    };

    let postId = Time.now().toText();
    let post : GroupPost = {
      id = postId;
      groupId = input.groupId;
      author = caller;
      content = input.content;
      image = input.image;
      timestamp = Time.now();
    };

    groupPosts.add(postId, post);
    postId;
  };

  public query ({ caller }) func getGroupFeed(groupId : Text) : async [GroupPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access group feeds");
    };
    if (not isGroupMember(groupId, caller)) {
      Runtime.trap("Unauthorized: Only group members can view this group's feed");
    };

    groupPosts.values().toArray().filter(func(p) { p.groupId == groupId }).sort(GroupPost.compareByTimestamp);
  };

  public query ({ caller }) func listGroupPosts(groupId : Text) : async [GroupPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access group posts");
    };
    if (not isGroupMember(groupId, caller)) {
      Runtime.trap("Unauthorized: Only group members can view this group's posts");
    };
    groupPosts.values().toArray().filter(func(p) { p.groupId == groupId }).sort(GroupPost.compareByTimestamp);
  };

  public shared ({ caller }) func createGroupComment(input : CreateGroupCommentInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create comments");
    };

    let post = switch (groupPosts.get(input.postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (not isGroupMember(post.groupId, caller)) {
      Runtime.trap("Unauthorized: Only group members can comment on this post");
    };

    let commentId = Time.now().toText();
    let comment : GroupComment = {
      id = commentId;
      postId = input.postId;
      author = caller;
      content = input.content;
      timestamp = Time.now();
    };

    groupComments.add(commentId, comment);

    // Create notification for post author
    if (post.author != caller) {
      let username = switch (userProfiles.get(caller)) {
        case (null) { caller.toText() };
        case (?profile) { profile.username };
      };
      createNotificationInternal({
        recipient = post.author;
        notificationType = #comment;
        referenceId = input.postId;
        message = username # " commented on your group post";
      });
    };

    commentId;
  };

  public query ({ caller }) func getGroupComments(postId : Text) : async [GroupComment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };
    let post = switch (groupPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };
    if (not isGroupMember(post.groupId, caller)) {
      Runtime.trap("Unauthorized: Only group members can view comments on this post");
    };
    groupComments.values().toArray().filter(func(c) { c.postId == postId }).sort(GroupComment.compareByTimestamp);
  };

  public query ({ caller }) func getAllCommunityGroups() : async [(Text, Text, Text, Principal, Timestamp, [Principal])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access groups");
    };
    func convertGroup(g : Group) : (Text, Text, Text, Principal, Timestamp, [Principal]) {
      (g.id, g.name, g.description, g.creator, g.createdAt, g.members.toArray());
    };
    groups.values().toArray().map(func(g) { convertGroup(g) });
  };

  public shared ({ caller }) func createGroup(groupName : Text, groupDescription : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create groups");
    };

    let existingGroup = groups.values().toArray().find(
      func(g) { Text.equal(g.name, groupName) });

    switch (existingGroup) {
      case (null) {
        let groupId = Time.now().toText();
        let group : Group = {
          id = groupId;
          name = groupName;
          description = groupDescription;
          creator = caller;
          createdAt = Time.now();
          members = Set.singleton(caller);
        };

        groups.add(groupId, group);
        groupId;
      };
      case (?(g)) {
        Runtime.trap("Group with this name already exists. Existing group: " # g.name);
      };
    };
  };

  public shared ({ caller }) func joinGroup(groupId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join groups");
    };

    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) { group.members.add(caller) };
    };
  };

  public shared ({ caller }) func leaveGroup(groupId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave groups");
    };

    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) {
        if (group.creator == caller) {
          Runtime.trap("Group creator cannot leave the group");
        };
        group.members.remove(caller);
      };
    };
  };

  public query ({ caller }) func getGroupMembers(groupId : Text) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view group members");
    };

    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) { group.members.toArray() };
    };
  };

  public query ({ caller }) func searchGroups(searchTerm : Text) : async [(Text, Text, Text, Principal, Timestamp, [Principal])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search groups");
    };
    func convertGroup(g : Group) : (Text, Text, Text, Principal, Timestamp, [Principal]) {
      (g.id, g.name, g.description, g.creator, g.createdAt, g.members.toArray());
    };
    groups.values().toArray().filter(
      func(g) { g.name.contains(#text searchTerm) or g.description.contains(#text searchTerm) }
    ).map(func(g) { convertGroup(g) });
  };

  public query ({ caller }) func isUserGroupMember(groupId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check membership status");
    };
    isGroupMember(groupId, caller);
  };

  public shared ({ caller }) func deleteGroup(groupId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete groups");
    };

    let group = switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?g) { g };
    };

    // Delete all group posts
    let postsToDelete = groupPosts.values().toArray().filter(func(p) { p.groupId == groupId });
    for (post in postsToDelete.vals()) {
      groupPosts.remove(post.id);
      // Delete all comments for this post
      let commentsToDelete = groupComments.values().toArray().filter(func(c) { c.postId == post.id });
      for (comment in commentsToDelete.vals()) {
        groupComments.remove(comment.id);
      };
    };

    // Delete the group itself
    groups.remove(groupId);
  };

  public shared ({ caller }) func removeUserFromGroup(groupId : Text, user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove users from groups");
    };

    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) {
        if (group.creator == user) {
          Runtime.trap("Cannot remove the group creator from the group");
        };
        group.members.remove(user);
      };
    };
  };

  //
  // Collection Operations
  //

  public shared ({ caller }) func createCollectionPost(input : CreateCollectionInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create collection posts");
    };

    let postId = Time.now().toText();
    let post : CollectionPost = {
      id = postId;
      author = caller;
      image = input.image;
      caption = input.caption;
      timestamp = Time.now();
    };

    collections.add(postId, post);
    postId;
  };

  public query ({ caller }) func getAllCollectionPosts() : async [CollectionPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view collection posts");
    };
    collections.values().toArray().sort(CollectionPost.compareByTimestamp);
  };

  public shared ({ caller }) func createCollectionComment(input : CreateCollectionCommentInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create collection comments");
    };

    let commentId = Time.now().toText();
    let comment : CollectionComment = {
      id = commentId;
      postId = input.postId;
      author = caller;
      content = input.content;
      timestamp = Time.now();
    };

    collectionComments.add(commentId, comment);

    // Create notification for post author
    switch (collections.get(input.postId)) {
      case (null) {};
      case (?post) {
        if (post.author != caller) {
          let username = switch (userProfiles.get(caller)) {
            case (null) { caller.toText() };
            case (?profile) { profile.username };
          };
          createNotificationInternal({
            recipient = post.author;
            notificationType = #comment;
            referenceId = input.postId;
            message = username # " commented on your collection post";
          });
        };
      };
    };

    commentId;
  };

  public query ({ caller }) func getCollectionComments(postId : Text) : async [CollectionComment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view collection comments");
    };
    collectionComments.values().toArray().filter(func(c) { c.postId == postId }).sort(CollectionComment.compareByTimestamp);
  };

  public shared ({ caller }) func toggleCollectionLike(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like collection posts");
    };

    let alreadyLiked = switch (collectionLikes.get(postId)) {
      case (null) { false };
      case (?s) { s.contains(caller) };
    };

    if (alreadyLiked) {
      switch (collectionLikes.get(postId)) {
        case (null) {};
        case (?s) {
          s.remove(caller);
          if (s.isEmpty()) {
            collectionLikes.remove(postId);
          };
        };
      };
    } else {
      switch (collectionLikes.get(postId)) {
        case (null) {
          let s = Set.singleton(caller);
          collectionLikes.add(postId, s);
        };
        case (?s) { s.add(caller) };
      };

      // Create notification for post author when liked
      switch (collections.get(postId)) {
        case (null) {};
        case (?post) {
          if (post.author != caller) {
            let username = switch (userProfiles.get(caller)) {
              case (null) { caller.toText() };
              case (?profile) { profile.username };
            };
            createNotificationInternal({
              recipient = post.author;
              notificationType = #like;
              referenceId = postId;
              message = username # " liked your collection post";
            });
          };
        };
      };
    };
  };

  public query ({ caller }) func getCollectionLikeCount(postId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view collection like counts");
    };
    switch (collectionLikes.get(postId)) {
      case (null) { 0 };
      case (?l) { l.size() };
    };
  };

  public query ({ caller }) func hasUserLikedCollection(postId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check collection like status");
    };
    switch (collectionLikes.get(postId)) {
      case (null) { false };
      case (?l) { l.contains(caller) };
    };
  };

  //
  // Resource Operations
  //

  public shared ({ caller }) func createResource(input : CreateResourceInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create resources");
    };

    let resourceId = Time.now().toText();
    let resource : Resource = {
      id = resourceId;
      title = input.title;
      content = input.content;
      createdBy = caller;
      createdAt = Time.now();
    };

    resources.add(resourceId, resource);
    resourceId;
  };

  public query ({ caller }) func getAllResources() : async [Resource] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view resources");
    };
    resources.values().toArray();
  };

  public query ({ caller }) func getResource(resourceId : Text) : async ?Resource {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access resources");
    };
    resources.get(resourceId);
  };

  //
  // Discussion Operations
  //

  public shared ({ caller }) func createDiscussionPost(input : CreateDiscussionInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create discussion posts");
    };

    let postId = Time.now().toText();
    let post : DiscussionPost = {
      id = postId;
      author = caller;
      topic = input.topic;
      content = input.content;
      image = input.image;
      timestamp = Time.now();
    };

    discussions.add(postId, post);
    postId;
  };

  public query ({ caller }) func getAllDiscussionPosts(topic : Text) : async [DiscussionPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view discussion posts");
    };
    discussions.values().toArray().filter(func(p) { p.topic == topic }).sort(DiscussionPost.compareByTimestamp);
  };

  public shared ({ caller }) func createDiscussionComment(input : CreateDiscussionCommentInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create discussion comments");
    };

    let commentId = Time.now().toText();
    let comment : DiscussionComment = {
      id = commentId;
      postId = input.postId;
      author = caller;
      content = input.content;
      timestamp = Time.now();
    };

    discussionComments.add(commentId, comment);

    // Create notification for post author
    switch (discussions.get(input.postId)) {
      case (null) {};
      case (?post) {
        if (post.author != caller) {
          let username = switch (userProfiles.get(caller)) {
            case (null) { caller.toText() };
            case (?profile) { profile.username };
          };
          createNotificationInternal({
            recipient = post.author;
            notificationType = #comment;
            referenceId = input.postId;
            message = username # " commented on your discussion post";
          });
        };
      };
    };

    commentId;
  };

  public query ({ caller }) func getDiscussionComments(postId : Text) : async [DiscussionComment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view discussion comments");
    };
    discussionComments.values().toArray().filter(func(c) { c.postId == postId }).sort(DiscussionComment.compareByTimestamp);
  };

  public shared ({ caller }) func toggleDiscussionLike(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like discussion posts");
    };

    let alreadyLiked = switch (discussionLikes.get(postId)) {
      case (null) { false };
      case (?s) { s.contains(caller) };
    };

    if (alreadyLiked) {
      switch (discussionLikes.get(postId)) {
        case (null) {};
        case (?s) {
          s.remove(caller);
          if (s.isEmpty()) {
            discussionLikes.remove(postId);
          };
        };
      };
    } else {
      switch (discussionLikes.get(postId)) {
        case (null) {
          let s = Set.singleton(caller);
          discussionLikes.add(postId, s);
        };
        case (?s) { s.add(caller) };
      };

      // Create notification for post author when liked
      switch (discussions.get(postId)) {
        case (null) {};
        case (?post) {
          if (post.author != caller) {
            let username = switch (userProfiles.get(caller)) {
              case (null) { caller.toText() };
              case (?profile) { profile.username };
            };
            createNotificationInternal({
              recipient = post.author;
              notificationType = #like;
              referenceId = postId;
              message = username # " liked your discussion post";
            });
          };
        };
      };
    };
  };

  public query ({ caller }) func getDiscussionLikeCount(postId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view discussion like counts");
    };
    switch (discussionLikes.get(postId)) {
      case (null) { 0 };
      case (?l) { l.size() };
    };
  };

  public query ({ caller }) func hasUserLikedDiscussion(postId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check discussion like status");
    };
    switch (discussionLikes.get(postId)) {
      case (null) { false };
      case (?l) { l.contains(caller) };
    };
  };

  //
  // Event Operations
  //

  public shared ({ caller }) func createEvent(input : CreateEventInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create events");
    };

    let eventId = Time.now().toText();
    let event : EventPost = {
      id = eventId;
      title = input.title;
      description = input.description;
      createdBy = caller;
      image = input.image;
      timestamp = Time.now();
    };

    events.add(eventId, event);
    eventId;
  };

  public query ({ caller }) func getAllEvents() : async [EventPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };
    events.values().toArray().sort(EventPost.compareByTimestamp);
  };

  public shared ({ caller }) func createEventComment(input : CreateEventCommentInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create event comments");
    };

    let commentId = Time.now().toText();
    let comment : EventComment = {
      id = commentId;
      postId = input.postId;
      author = caller;
      content = input.content;
      timestamp = Time.now();
    };

    eventComments.add(commentId, comment);

    // Create notification for event creator
    switch (events.get(input.postId)) {
      case (null) {};
      case (?event) {
        if (event.createdBy != caller) {
          let username = switch (userProfiles.get(caller)) {
            case (null) { caller.toText() };
            case (?profile) { profile.username };
          };
          createNotificationInternal({
            recipient = event.createdBy;
            notificationType = #comment;
            referenceId = input.postId;
            message = username # " commented on your event";
          });
        };
      };
    };

    commentId;
  };

  public query ({ caller }) func getEventComments(postId : Text) : async [EventComment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view event comments");
    };
    eventComments.values().toArray().filter(func(c) { c.postId == postId }).sort(EventComment.compareByTimestamp);
  };

  public query ({ caller }) func searchEvents(searchTerm : Text) : async [EventPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search events");
    };
    events.values().toArray().filter(
      func(e) { e.title.contains(#text searchTerm) or e.description.contains(#text searchTerm) }
    );
  };
};
