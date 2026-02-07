import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const BACKGROUND_OPTIONS = [
  { id: 'default', name: 'Default', gradient: 'from-pink-100 via-purple-100 to-blue-100' },
  { id: 'sunset', name: 'Sunset', gradient: 'from-orange-100 via-pink-100 to-purple-100' },
  { id: 'ocean', name: 'Ocean', gradient: 'from-blue-100 via-cyan-100 to-teal-100' },
  { id: 'forest', name: 'Forest', gradient: 'from-green-100 via-emerald-100 to-teal-100' },
  { id: 'lavender', name: 'Lavender', gradient: 'from-purple-100 via-pink-100 to-purple-100' },
  { id: 'peach', name: 'Peach', gradient: 'from-orange-50 via-pink-50 to-rose-100' },
];

interface ProfileCustomizationModalProps {
  currentBackground: string;
  currentTags: string[];
  onSave: (background: string, tags: string[]) => void;
  onClose: () => void;
}

export default function ProfileCustomizationModal({
  currentBackground,
  currentTags,
  onSave,
  onClose,
}: ProfileCustomizationModalProps) {
  const [selectedBackground, setSelectedBackground] = useState(currentBackground);
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    } else if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    onSave(selectedBackground, tags);
    toast.success('Profile customization saved! 🎨');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Customize Your Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Background Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Profile Background</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg.id)}
                  className={`relative h-24 rounded-2xl bg-gradient-to-r ${bg.gradient} transition-all ${
                    selectedBackground === bg.id
                      ? 'ring-4 ring-pink-500 scale-105'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full">
                      {bg.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Tags */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Favorite Plush Tags (Max 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., Vintage, Kawaii)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                maxLength={20}
                className="rounded-full"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.length >= 5}
                size="icon"
                className="rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full gap-1 pr-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Preview</Label>
            <div className={`h-32 rounded-2xl bg-gradient-to-r ${BACKGROUND_OPTIONS.find(bg => bg.id === selectedBackground)?.gradient} p-4 flex items-end`}>
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-3 backdrop-blur-sm">
                <p className="font-semibold mb-1">Your Profile</p>
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
