import clsx from 'clsx';
import { AppSidebar } from './sidebar/AppSidebar';
import { Separator } from './ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  padding?: boolean;
  header?: boolean;
}

export default function Layout({ children, headerContent, padding = true, header = true }: LayoutProps) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {header && (
            <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              {headerContent}
            </header>
          )}
          <div className='min-h-screen bg-background w-full'>
            <main className={clsx(
              padding ? 'p-4' : 'p-0',
              header ? 'container mx-auto' : '',
            )}>
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster duration={3500} />
    </>
  );
}
