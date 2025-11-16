'use client';

import { formatDistance } from 'date-fns';
import { Archive, ExternalLink } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  Document,
  PodcastDocumentMetadata,
  PodcastDocumentStatus,
} from '@/lib/db/schema';
import { cn, fetcher } from '@/lib/utils';
import { RefreshCcwIcon } from './icons';

type DocumentWithEffectiveMetadata = Document & {
  metadata: PodcastDocumentMetadata & { status: PodcastDocumentStatus };
};

type DocumentsViewProps = {
  initialDocuments: DocumentWithEffectiveMetadata[];
};

export function DocumentsView({ initialDocuments }: DocumentsViewProps) {
  const router = useRouter();
  const _searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] =
    useState<PodcastDocumentStatus>('active');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading, mutate } = useSWR<{
    documents: DocumentWithEffectiveMetadata[];
  } | null>(
    `/api/document/list?status=${statusFilter}&q=${encodeURIComponent(query)}`,
    fetcher,
    {
      fallbackData: { documents: initialDocuments },
      revalidateOnMount: true,
    },
  );

  const documents = useMemo(() => data?.documents ?? [], [data?.documents]);

  const onArchiveToggle = useCallback(
    async (id: string, nextStatus: PodcastDocumentStatus) => {
      await fetch('/api/document/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      await mutate();
    },
    [mutate]
  );

  const onOpenDocument = useCallback(
    (id: string) => {
      router.push(`/documents/${id}`);
    },
    [router]
  );

  const activeCount = useMemo(
    () =>
      initialDocuments.filter(
        (doc) =>
          ((doc.metadata as PodcastDocumentMetadata)?.status ?? 'active') ===
          'active'
      ).length,
    [initialDocuments]
  );

  const archivedCount = useMemo(
    () =>
      initialDocuments.filter(
        (doc) =>
          ((doc.metadata as PodcastDocumentMetadata)?.status ?? 'active') ===
          'archived'
      ).length,
    [initialDocuments]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 md:py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Documents
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              View everything your agents have created so far – podcast briefs,
              production plans, guest dossiers, and more. You can quickly open
              or archive documents to keep your workspace focused.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => router.push('/chat')}
            >
              Back to chat
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => mutate()}
            >
              <span className="sr-only">Refresh</span>
              <RefreshCcwIcon size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Tabs
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as PodcastDocumentStatus)
            }
            className="w-full md:w-auto shadow-none"
          >
            <TabsList className="inline-flex w-full items-center gap-2 rounded-full border bg-background/80 p-1 text-xs shadow-none md:w-auto md:flex-none">
              <TabsTrigger
                value="active"
                className="flex-1 rounded-full px-2 py-1 text-xs transition md:flex-none text-muted-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                Active
                <span className="ml-1 rounded-full bg-background/30 px-1.5 text-[10px]">
                  {activeCount}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="flex-1 rounded-full px-2 py-1 text-xs transition md:flex-none text-muted-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                Archived
                {archivedCount > 0 && (
                  <span className="ml-1 rounded-full bg-background/30 px-1.5 text-[10px]">
                    {archivedCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="w-full md:w-80 flex items-center gap-2">
            <Input
              placeholder="Search by title..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 text-xs md:text-xs shadow-none"
            />
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as 'grid' | 'list')}
              className="hidden sm:block shadow-none"
            >
              <TabsList className="inline-flex rounded-full border bg-background/80 p-1 text-xs">
                <TabsTrigger
                  value="list"
                  className="rounded-full px-2 py-1 text-xs transition text-muted-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="grid"
                  className="rounded-full px-2 py-1 text-xs transition text-muted-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div
          className={cn(
            'mt-2 grid gap-3',
            viewMode === 'grid'
              ? 'md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {isLoading && documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Loading documents...
            </p>
          ) : documents.length === 0 ? (
            <Card className="col-span-full flex flex-col items-center justify-center gap-2 border-dashed py-10 text-center">
              <p className="text-sm font-medium">
                No {statusFilter === 'archived' ? 'archived' : 'active'}{' '}
                documents yet.
              </p>
              <p className="max-w-md text-xs text-muted-foreground">
                As you work with Ida, Astra, and Ember, they&apos;ll create
                documents here: concept briefs, episode plans, guest dossiers,
                and more.
              </p>
            </Card>
          ) : (
            documents.map((doc) => {
              const metadata = (doc.metadata ?? undefined) as
                | PodcastDocumentMetadata
                | undefined;
              const status = metadata?.status ?? 'active';
              const typeLabel =
                metadata?.type?.replace(/_/g, ' ') || 'General document';
              const agentLabel = metadata?.agentId
                ? metadata.agentId.charAt(0).toUpperCase() +
                  metadata.agentId.slice(1)
                : null;

              return (
                <Card
                  key={doc.id}
                  className="group flex flex-col justify-between rounded-xl border-border/60 bg-background/80 p-4 backdrop-blur-sm transition hover:border-primary/40 hover:shadow-sm cursor-pointer"
                  onClick={() => onOpenDocument(doc.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h2 className="line-clamp-2 text-sm font-semibold">
                          {doc.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-1.5">
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
                          {agentLabel && (
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {agentLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-xs text-muted-foreground">
                      {doc.content?.slice(0, 200) ||
                        'No content yet – the agent will fill this in as you progress.'}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>
                      Updated{' '}
                      {formatDistance(new Date(doc.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-7 px-2 text-[11px]',
                          'group-hover:text-primary'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveToggle(
                            doc.id,
                            status === 'archived' ? 'active' : 'archived'
                          );
                        }}
                      >
                        {status === 'archived' ? 'Unarchive' : 'Archive'}
                        <Archive className="ml-1 h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-7 px-2 text-[11px]',
                          'group-hover:text-primary'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDocument(doc.id);
                        }}
                      >
                        Open
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
