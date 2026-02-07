// Predefined emoji reactions that match backend validation
export const EMOJI_REACTIONS = [
  { id: 'like', emoji: '👍', label: 'Like' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'smiling_face', emoji: '😊', label: 'Smile' },
  { id: 'surprised_face', emoji: '😮', label: 'Surprised' },
  { id: 'dislike', emoji: '👎', label: 'Dislike' },
] as const;

export type EmojiReactionId = typeof EMOJI_REACTIONS[number]['id'];
