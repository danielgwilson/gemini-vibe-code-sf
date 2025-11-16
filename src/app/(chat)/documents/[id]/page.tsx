import { formatDistance } from 'date-fns';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { Response } from '@/components/elements/response';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { getDocumentsById } from '@/lib/db/queries';
import type { Document, PodcastDocumentMetadata } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const documents = await getDocumentsById({ id });
  const latest: Document | undefined = documents.at(-1);

  if (!latest) {
    notFound();
  }

  if (latest.userId !== session.user.id) {
    notFound();
  }

  const metadata = (latest.metadata ?? undefined) as
    | PodcastDocumentMetadata
    | undefined;
  const status = metadata?.status ?? 'active';
  const typeLabel = metadata?.type?.replace(/_/g, ' ') || 'General';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 md:py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status === 'archived' ? 'outline' : 'secondary'}>
                {status === 'archived' ? 'Archived' : 'Active'}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase">
                {typeLabel}
              </Badge>
            </div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              {latest.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Updated{' '}
              {formatDistance(new Date(latest.createdAt), new Date(), {
                addSuffix: true,
              })}
            </p>
          </div>

          <a
            href="/documents"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'mt-1',
            )}
          >
            Back to documents
          </a>
        </div>

        <div className="overflow-hidden rounded-xl border bg-background/80 shadow-lg backdrop-blur-sm">
          <div className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Document content
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-4 py-4 text-sm leading-relaxed md:px-6 md:py-6">
            {latest.kind === 'image' ? (
              latest.content ? (
                <Image
                  alt={latest.title}
                  className="mx-auto max-h-[60vh] max-w-full rounded-lg border shadow-sm"
                  width={800}
                  height={600}
                  src={`data:image/png;base64,${latest.content}`}
                />
              ) : (
                <p className="text-muted-foreground">
                  No image content available for this document.
                </p>
              )
            ) : latest.content ? (
              <Response className="prose prose-sm max-w-none dark:prose-invert">
                {latest.content}
              </Response>
            ) : (
              <p className="text-muted-foreground">
                This document does not contain any content yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
