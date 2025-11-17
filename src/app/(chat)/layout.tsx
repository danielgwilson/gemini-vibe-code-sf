import { cookies } from 'next/headers';
import Script from 'next/script';
import { getServerSession } from 'next-auth';
import { AppSidebar } from '@/components/app-sidebar';
import { DataStreamProvider } from '@/components/data-stream-provider';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '../(auth)/auth';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([
    getServerSession(authOptions),
    cookies(),
  ]);
  const isCollapsed = cookieStore.get('sidebar_state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <SidebarProvider defaultOpen={!isCollapsed}>
          <AppSidebar user={session?.user} />
          <SidebarInset className="flex h-full overflow-hidden">{children}</SidebarInset>
        </SidebarProvider>
      </DataStreamProvider>
    </>
  );
}
