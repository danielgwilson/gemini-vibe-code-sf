'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { BoxIcon, FileIcon, PlusIcon } from '@/components/icons';
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { mutate } = useSWRConfig();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const pathname = usePathname();

  const isWorkspaceRoute = pathname.startsWith('/workspace');
  const isDocumentsRoute = pathname.startsWith('/documents');

  const handleDeleteAll = () => {
    const deletePromise = fetch('/api/history', {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting all chats...',
      success: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        router.push('/');
        setShowDeleteAllDialog(false);
        return 'All chats deleted successfully';
      },
      error: 'Failed to delete all chats',
    });
  };

  return (
    <>
      <Sidebar
        className="group-data-[side=left]:border-r-0"
        collapsible="icon"
        variant="inset"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href="/chat" onClick={() => setOpenMobile(false)}>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    GV
                  </span>
                  <span className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                    <span>Gemcast</span>
                    <span className="text-[10px] font-normal text-sidebar-foreground/60">
                      Podcast workspace
                    </span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-2 pb-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="sm"
                tooltip="New chat"
                onClick={() => {
                  setOpenMobile(false);
                  router.push('/chat');
                }}
              >
                <button type="button">
                  <PlusIcon />
                  <span className="group-data-[collapsible=icon]:hidden">
                    New chat
                  </span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="sm"
                tooltip="Workspace"
                isActive={isWorkspaceRoute}
                onClick={() => {
                  setOpenMobile(false);
                  router.push('/workspace');
                }}
              >
                <button type="button">
                  <BoxIcon size={16} />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Workspace
                  </span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="sm"
                tooltip="Documents"
                isActive={isDocumentsRoute}
                onClick={() => {
                  setOpenMobile(false);
                  router.push('/documents');
                }}
              >
                <button type="button">
                  <FileIcon />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Documents
                  </span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarHistory user={user} />
        </SidebarContent>
        <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your chats and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
