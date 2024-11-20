import { AppSidebar } from './sidebar/AppSidebar';
import { SidebarProvider, SidebarTrigger } from './ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className='min-h-screen bg-background w-full'>
        <header className='bg-sidebar text-sidebar-foreground p-4 border-b border-border flex items-center justify-between'>
          <SidebarTrigger />
          <h1>My Application Header</h1>
        </header>
        <main>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
