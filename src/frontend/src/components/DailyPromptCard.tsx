import { Sparkles, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Mock daily prompts - will be replaced with backend data
const DAILY_PROMPTS = [
  "What's the story behind your oldest plushie?",
  "Share a photo of your plushie in their favorite spot!",
  "If your plushie could talk, what would they say?",
  "Show us your most creative plushie display!",
  "What plushie are you hoping to add to your collection next?",
  "Share a memory that your favorite plushie reminds you of.",
  "How do you organize your plushie collection?",
];

export default function DailyPromptCard() {
  // Get today's prompt based on day of year
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const promptIndex = dayOfYear % DAILY_PROMPTS.length;
  const todayPrompt = DAILY_PROMPTS[promptIndex];

  return (
    <Card className="mb-6 rounded-3xl border-2 border-pink-300 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:border-purple-700 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 shadow-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img
              src="/assets/generated/daily-prompt-illustration.dim_600x400.png"
              alt="Daily Prompt"
              className="h-24 w-24 rounded-2xl object-cover shadow-md"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Today's Cozy Prompt
              </h3>
            </div>
            <p className="text-base font-medium text-foreground mb-2">
              {todayPrompt}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
