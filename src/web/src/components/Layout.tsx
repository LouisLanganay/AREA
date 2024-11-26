import { AppSidebar } from './sidebar/AppSidebar';
import { Separator } from './ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
        </header>
        <div className='min-h-screen bg-background w-full'>
          <main className='p-4 container mx-auto'>
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
