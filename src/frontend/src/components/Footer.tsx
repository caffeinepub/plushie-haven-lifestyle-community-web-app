import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-pink-200/50 bg-white/60 backdrop-blur-sm dark:border-purple-800/50 dark:bg-gray-900/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025. Built with{' '}
            <Heart className="inline h-4 w-4 fill-pink-500 text-pink-500" />{' '}
            using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
