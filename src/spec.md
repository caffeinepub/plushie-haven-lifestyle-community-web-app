# Specification

## Summary
**Goal:** Improve reliability and performance of image uploads across all post-creation flows, and add quick emoji reactions on plushie feed posts.

**Planned changes:**
- Standardize frontend image upload validation, preprocessing, and error handling across CreatePostCard, CollectionsPage, DiscussionsPage, GroupDetailPage, and MarketplacePage (consistent checks, clear toast errors, sane progress reset).
- Add client-side image resizing/compression before converting to `ExternalBlob`, preserve correct preview orientation, and enforce a final optimized byte-size limit with a clear blocking error.
- Add backend validation for image-based post creation methods (including `createPost`, `createCollectionPost`, and any other existing `create*` methods that accept image blobs) to return consistent, user-friendly error/trap messages for invalid inputs.
- Implement “quick reactions” (predefined emoji set) end-to-end: backend APIs to get counts, get caller reaction, and set/clear reaction; frontend reaction bar on PostCard with toggle behavior, login gating, and React Query refresh of counts.

**User-visible outcome:** Users can upload images more reliably (with faster uploads and clearer error messages) across all relevant creation UIs, and logged-in users can react to plushie feed posts with predefined emojis while everyone can see reaction counts.
