import { tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import {
  createGoogleDoc,
  createTextFile,
  findOrCreateFolder,
  getDriveClient,
} from '@/lib/google/drive';

type GoogleDriveWriteProps = {
  session: Session;
};

export const googleDriveWrite = ({ session }: GoogleDriveWriteProps) =>
  tool({
    description:
      'Create folders and files in Google Drive. Use this to set up podcast folder structures, save episode templates, briefing docs, outlines, show notes, and other production assets.',
    inputSchema: z.object({
      action: z
        .enum(['create_folder', 'create_doc', 'create_file', 'setup_podcast_folders'])
        .describe(
          'Action to perform: "create_folder" to create a folder, "create_doc" to create a Google Doc, "create_file" to create a text file, "setup_podcast_folders" to create the standard podcast folder structure',
        ),
      folderName: z
        .string()
        .optional()
        .describe('Name of the folder to create (for create_folder)'),
      parentFolderId: z
        .string()
        .optional()
        .describe('Parent folder ID (optional, defaults to root)'),
      title: z
        .string()
        .optional()
        .describe('Document/file title (for create_doc and create_file)'),
      content: z
        .string()
        .optional()
        .describe('Document/file content (for create_doc and create_file)'),
      fileName: z
        .string()
        .optional()
        .describe('File name (for create_file)'),
      mimeType: z
        .string()
        .optional()
        .describe('MIME type for file (defaults to text/plain for create_file)'),
    }),
    execute: async ({ action, folderName, parentFolderId, title, content, fileName, mimeType }) => {
      try {
        if (!session.accessToken) {
          return {
            error:
              'No access token available. Please sign out and sign back in to refresh your Google authentication.',
          };
        }

        const drive = getDriveClient(session);

        if (action === 'setup_podcast_folders') {
          // Create main Podcast folder
          const podcastFolder = await findOrCreateFolder(drive, 'Podcast');

          // Create subfolders
          const brandingFolder = await findOrCreateFolder(drive, '01_Branding', podcastFolder.id!);
          const episodesFolder = await findOrCreateFolder(drive, '02_Episodes', podcastFolder.id!);
          const marketingFolder = await findOrCreateFolder(drive, '03_Marketing_Assets', podcastFolder.id!);

          return {
            success: true,
            action: 'setup_podcast_folders',
            folders: {
              podcast: {
                id: podcastFolder.id,
                name: podcastFolder.name,
              },
              branding: {
                id: brandingFolder.id,
                name: brandingFolder.name,
              },
              episodes: {
                id: episodesFolder.id,
                name: episodesFolder.name,
              },
              marketing: {
                id: marketingFolder.id,
                name: marketingFolder.name,
              },
            },
          };
        }

        if (action === 'create_folder') {
          if (!folderName) {
            return {
              error: 'folderName is required for create_folder',
            };
          }

          const folder = await findOrCreateFolder(drive, folderName, parentFolderId);

          return {
            success: true,
            action: 'create_folder',
            folder: {
              id: folder.id,
              name: folder.name,
            },
          };
        }

        if (action === 'create_doc') {
          if (!title || !content) {
            return {
              error: 'title and content are required for create_doc',
            };
          }

          const doc = await createGoogleDoc(drive, {
            title,
            content,
            parentFolderId,
          });

          return {
            success: true,
            action: 'create_doc',
            document: {
              id: doc.id,
              name: doc.name,
              webViewLink: doc.webViewLink,
            },
          };
        }

        if (action === 'create_file') {
          if (!fileName || !content) {
            return {
              error: 'fileName and content are required for create_file',
            };
          }

          const file = await createTextFile(drive, {
            name: fileName,
            content,
            parentFolderId,
            mimeType,
          });

          return {
            success: true,
            action: 'create_file',
            file: {
              id: file.id,
              name: file.name,
              webViewLink: file.webViewLink,
            },
          };
        }

        return {
          error: `Unknown action: ${action}`,
        };
      } catch (error) {
        console.error('Error in googleDriveWrite tool:', error);

        if (error instanceof Error) {
          if (error.message.includes('Invalid Credentials') || error.message.includes('401')) {
            return {
              error:
                'Authentication failed. Please sign out and sign back in to refresh your Google authentication.',
            };
          }

          if (error.message.includes('403')) {
            return {
              error:
                'Permission denied. Make sure you have granted the necessary Google Drive permissions.',
            };
          }

          return {
            error: `Failed to write to Drive: ${error.message}`,
          };
        }

        return {
          error: 'An unexpected error occurred while writing to Google Drive.',
        };
      }
    },
  });

