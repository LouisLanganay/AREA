import { AppSidebar } from './sidebar/AppSidebar';
import { Separator } from './ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export default function Layout({ children, headerContent }: LayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          {headerContent}
        </header>
        <div className='min-h-screen bg-background w-full'>
          <main className='p-4 container mx-auto'>
            {children}
          </main>
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
