import { auth } from '@/app/(auth)/auth';
import { getDocumentsByUserId } from '@/lib/db/queries';
import type {
  Document,
  PodcastDocumentMetadata,
  PodcastDocumentStatus,
} from '@/lib/db/schema';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:document').toResponse();
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get(
    'status',
  ) as PodcastDocumentStatus | null;
  const q = searchParams.get('q');

  const rawDocuments = await getDocumentsByUserId({
    userId: session.user.id,
  });

  // Reduce to latest version per document id.
  const latestById = new Map<string, Document>();

  for (const doc of rawDocuments) {
    const existing = latestById.get(doc.id);
    if (!existing || existing.createdAt < doc.createdAt) {
      latestById.set(doc.id, doc);
    }
  }

  let documents = Array.from(latestById.values());

  // Default status is 'active' when metadata.status is missing.
  if (statusParam === 'active' || statusParam === 'archived') {
    documents = documents.filter((doc) => {
      const metadata = (doc.metadata ?? undefined) as
        | PodcastDocumentMetadata
        | undefined;
      const currentStatus = metadata?.status ?? 'active';
      return currentStatus === statusParam;
    });
  }

  if (q) {
    const query = q.toLowerCase();
    documents = documents.filter((doc) =>
      doc.title.toLowerCase().includes(query),
    );
  }

  return Response.json(
    {
      documents,
    },
    { status: 200 },
  );
}
