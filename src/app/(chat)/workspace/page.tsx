import { formatDistance } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getChatsByUserId, getDocumentsByUserId } from '@/lib/db/queries';
import type { Document, PodcastDocumentMetadata } from '@/lib/db/schema';

export default async function WorkspacePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const displayName = session.user.name || session.user.email || 'there';
  const firstName = displayName.split(' ')[0];
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const greeting =
    session.user.name && firstName ? `Hi, ${firstName}` : `Good ${timeOfDay}`;

  const [{ chats }, rawDocuments, quoteData] = await Promise.all([
    getChatsByUserId({
      id: session.user.id,
      limit: 8,
      startingAfter: null,
      endingBefore: null,
    }),
    getDocumentsByUserId({
      userId: session.user.id,
    }),
    (async () => {
      try {
        const res = await fetch('https://zenquotes.io/api/random', {
          // Cache the quote for an hour to respect rate limits and keep UX snappy.
          next: { revalidate: 60 * 60 },
        });
        if (!res.ok) return null;
        const json = (await res.json()) as
          | { q: string; a: string }[]
          | { q: string; a: string };
        const first = Array.isArray(json) ? json[0] : json;
        if (!first?.q || !first?.a) return null;
        return { quote: first.q, author: first.a };
      } catch {
        return null;
      }
    })(),
  ]);

  const latestDocsById = new Map<string, Document>();

  for (const doc of rawDocuments) {
    const existing = latestDocsById.get(doc.id);
    if (!existing || existing.createdAt < doc.createdAt) {
      latestDocsById.set(doc.id, doc);
    }
  }

  const recentDocuments = Array.from(latestDocsById.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <SidebarToggle className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              Workspace
            </span>
            <span className="text-[11px] text-muted-foreground">
              Recent chats and documents
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-3 md:pt-4 pb-4">
        <div className="px-4 pt-2 md:px-4">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl pb-2">
            {greeting}
          </h1>
          {quoteData && (
            <div className="mt-2 space-y-1 pb-4">
              <p className="text-base font-medium leading-relaxed md:text-lg">
                “{quoteData.quote}”
              </p>
              <p className="text-sm font-semibold text-muted-foreground md:text-base">
                —{quoteData.author}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="col-span-1 md:col-span-2 border-border/60 bg-background/90 pt-0 gap-0 shadow-none">
            <div className="flex items-center justify-between border-b px-5 py-2.5 md:py-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <h2 className="text-sm font-semibold whitespace-nowrap">
                  Recent chats
                </h2>
                <span className="text-xs text-muted-foreground truncate">
                  Jump back into your latest conversations.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs shrink-0"
                asChild
              >
                <Link href="/chat">
                  View all
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="max-h-[260px] overflow-y-auto px-3 py-2 md:px-4 md:py-3">
              {chats.length === 0 ? (
                <p className="px-2 text-xs text-muted-foreground">
                  No chats yet. Start a new chat to begin.
                </p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {chats.map((chatItem) => (
                    <li key={chatItem.id}>
                      <Link
                        href={`/chat/${chatItem.id}`}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted/80"
                      >
                        <span className="truncate">{chatItem.title}</span>
                        <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                          {formatDistance(
                            new Date(chatItem.createdAt),
                            new Date(),
                            { addSuffix: true }
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className="border-border/60 bg-background/90 pt-0 gap-0 shadow-none">
            <div className="flex items-center justify-between border-b px-4 py-2.5 md:py-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <h2 className="text-sm font-semibold whitespace-nowrap">
                  Recent documents
                </h2>
                <span className="text-xs text-muted-foreground truncate">
                  Quick access to your latest briefs, plans, and dossiers.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs shrink-0"
                asChild
              >
                <Link href="/documents">
                  View all
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="max-h-[260px] overflow-y-auto px-3 py-2 md:px-4 md:py-3">
              {recentDocuments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No documents yet. Ask Ida, Astra, or Ember to create one.
                </p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {recentDocuments.map((doc) => {
                    const metadata = (doc.metadata ?? undefined) as
                      | PodcastDocumentMetadata
                      | undefined;
                    const status = metadata?.status ?? 'active';
                    const typeLabel =
                      metadata?.type?.replace(/_/g, ' ') || 'Document';
                    return (
                      <li key={doc.id}>
                        <Link
                          href={`/documents/${doc.id}`}
                          className="flex flex-col gap-1 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted/80"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{doc.title}</span>
                            <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                              {formatDistance(
                                new Date(doc.createdAt),
                                new Date(),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className="border-border/60 bg-background/80 text-[10px] uppercase tracking-wide"
                            >
                              {typeLabel}
                            </Badge>
                            <Badge
                              variant={
                                status === 'archived' ? 'outline' : 'secondary'
                              }
                              className="text-[10px]"
                            >
                              {status === 'archived' ? 'Archived' : 'Active'}
                            </Badge>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* Placeholder for future widgets: upcoming recordings, inspiration, etc. */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-dashed border-border/50 bg-background/60 p-4 text-xs text-muted-foreground">
            <p>
              Upcoming episodes, recording schedule, or goal tracking can live
              here.
            </p>
          </Card>
          <Card className="border-dashed border-border/50 bg-background/60 p-4 text-xs text-muted-foreground">
            <p>Custom analytics or listener stats could go here later.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
