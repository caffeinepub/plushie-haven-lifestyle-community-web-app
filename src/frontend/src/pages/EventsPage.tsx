import { useGetAllEvents } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import EventPostCard from '../components/EventPostCard';

export default function EventsPage() {
  const { data: events = [], isLoading } = useGetAllEvents();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800">
          <Calendar className="h-10 w-10 text-pink-600 dark:text-pink-300" />
        </div>
        <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Events & Challenges
        </h2>
        <p className="text-muted-foreground">
          Join community challenges and special events
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {isLoading ? (
          <>
            {[1, 2].map((i) => (
              <Card key={i} className="rounded-3xl p-6">
                <Skeleton className="h-48 w-full mb-4 rounded-2xl" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </Card>
            ))}
          </>
        ) : events.length > 0 ? (
          events.map((event) => <EventPostCard key={event.id} event={event} />)
        ) : (
          <Card className="rounded-3xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
              <Calendar className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Check back soon for exciting community challenges and events!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
