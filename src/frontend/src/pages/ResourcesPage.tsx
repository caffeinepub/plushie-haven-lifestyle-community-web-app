import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Sparkles, Home as HomeIcon, Package } from 'lucide-react';

export default function ResourcesPage() {
  const resources = [
    {
      id: 1,
      icon: Sparkles,
      title: 'Plushie Care Guide',
      description: 'Essential tips for keeping your plushies clean and fluffy',
      content: [
        'Regular gentle brushing helps maintain softness',
        'Spot clean with mild soap and water for small stains',
        'For machine washing, use a pillowcase or mesh bag on gentle cycle',
        'Air dry completely to prevent mold and mildew',
        'Avoid direct sunlight to prevent fading',
        'Store in a cool, dry place away from moisture',
      ],
    },
    {
      id: 2,
      icon: Package,
      title: 'Storage Solutions',
      description: 'Creative ways to organize and protect your collection',
      content: [
        'Use clear storage bins for easy visibility',
        'Vacuum-sealed bags for long-term storage (use carefully)',
        'Hanging organizers maximize vertical space',
        'Shelving units with adjustable heights',
        'Avoid plastic bags that trap moisture',
        'Label containers for easy identification',
        'Rotate displayed plushies to prevent dust buildup',
      ],
    },
    {
      id: 3,
      icon: HomeIcon,
      title: 'Display Ideas',
      description: 'Showcase your plushies beautifully in your space',
      content: [
        'Floating shelves create a gallery wall effect',
        'Corner shelves utilize unused space',
        'Hammocks or nets for ceiling displays',
        'Shadow boxes for special or vintage pieces',
        'Themed groupings by color or character',
        'Rotating seasonal displays',
        'LED strip lights add ambiance',
        'Bookshelf integration with books and decor',
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800">
          <BookOpen className="h-10 w-10 text-pink-600 dark:text-pink-300" />
        </div>
        <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Resources & Guides
        </h2>
        <p className="text-muted-foreground">
          Helpful tips and guides for plushie care, storage, and display
        </p>
      </div>

      {/* Resources List */}
      <div className="space-y-6">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Card key={resource.id} className="rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex-shrink-0">
                    <Icon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {resource.title}
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <ul className="space-y-3">
                  {resource.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Note */}
      <Card className="mt-8 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 border-pink-200 dark:border-pink-800">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Have more tips to share? Join our discussions to help fellow plushie enthusiasts!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
