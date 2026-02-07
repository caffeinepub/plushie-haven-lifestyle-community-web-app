# Specification

## Summary
**Goal:** Ensure the app consistently displays authors/commenters by their saved profile username instead of a principal-like identifier.

**Planned changes:**
- Fix `useGetUserProfile(user: string)` to parse/construct a real `Principal` from the provided string before calling `actor.getUserProfile(...)`, and safely return `null` for invalid/unparseable input.
- Update `PostCard` to resolve `post.author` to a user profile and display `profile.username` when available, including deriving avatar fallback initials from the username when present.
- Update `CommentsSection`, `GroupPostCard`, and `GroupCommentsSection` to resolve author principals to profiles and display `profile.username` when available, with safe fallbacks when no profile exists.

**User-visible outcome:** Across the main feed, comments, and group posts/comments, authors are shown by their saved username when available; otherwise the UI falls back to a safe truncated principal without breaking layout.
