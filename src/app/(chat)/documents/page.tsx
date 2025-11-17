import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { DocumentsView } from '@/components/documents-view';
import { Separator } from '@/components/ui/separator';
import { getDocumentsByUserId } from '@/lib/db/queries';
import type {
  Document,
  PodcastDocumentMetadata,
  PodcastDocumentStatus,
} from '@/lib/db/schema';

type DocumentWithEffectiveMetadata = Document & {
  metadata: PodcastDocumentMetadata & { status: PodcastDocumentStatus };
};

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const rawDocuments = await getDocumentsByUserId({ userId: session.user.id });

  const latestById = new Map<string, Document>();

  for (const doc of rawDocuments) {
    const existing = latestById.get(doc.id);
    if (!existing || existing.createdAt < doc.createdAt) {
      latestById.set(doc.id, doc);
    }
  }

  const documents: DocumentWithEffectiveMetadata[] = Array.from(
    latestById.values(),
  ).map((doc) => {
    const base = (doc.metadata ?? undefined) as
      | PodcastDocumentMetadata
      | undefined;
    return {
      ...doc,
      metadata: {
        ...(base ?? {}),
        status: base?.status ?? 'active',
      },
    };
  });

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <SidebarToggle className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              Documents
            </span>
            <span className="text-[11px] text-muted-foreground">
              All briefs, plans, and dossiers created by your agents.
            </span>
          </div>
        </div>
      </header>
      <DocumentsView initialDocuments={documents} />
    </>
  );
}
