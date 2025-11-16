import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { DocumentsView } from '@/components/documents-view';
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

  return <DocumentsView initialDocuments={documents} />;
}
