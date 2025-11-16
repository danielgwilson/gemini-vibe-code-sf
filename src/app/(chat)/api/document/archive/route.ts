import { auth } from '@/app/(auth)/auth';
import { getDocumentsById, setDocumentStatus } from '@/lib/db/queries';
import type { PodcastDocumentStatus } from '@/lib/db/schema';
import { ChatSDKError } from '@/lib/errors';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:document').toResponse();
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.id !== 'string' || typeof body.status !== 'string') {
    return new ChatSDKError(
      'bad_request:document',
      'Body must include id and status.',
    ).toResponse();
  }

  const { id, status } = body as {
    id: string;
    status: PodcastDocumentStatus;
  };

  if (status !== 'active' && status !== 'archived') {
    return new ChatSDKError(
      'bad_request:document',
      'Invalid status value.',
    ).toResponse();
  }

  const documents = await getDocumentsById({ id });
  const [document] = documents;

  if (!document) {
    return new ChatSDKError('not_found:document').toResponse();
  }

  if (document.userId !== session.user.id) {
    return new ChatSDKError('forbidden:document').toResponse();
  }

  const updated = await setDocumentStatus({ id, status });

  return Response.json(updated, { status: 200 });
}
