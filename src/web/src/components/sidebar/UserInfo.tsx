import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { User } from '../../../../shared/Users';
import { ChevronUpDownIcon, ArrowLeftStartOnRectangleIcon, ArrowsRightLeftIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/auth/AuthContext';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function UserInfo({
  user,
}: {
  user: User | null
}) {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className={clsx(
                'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border'
              )}
            >
              <div className='flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                {user?.avatarUrl ? (
                  <img
                    src={user?.avatarUrl}
                    alt={user?.username}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <span className='text-xs size-8 flex items-center justify-center'>
                    {user?.username.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span className='font-semibold'>
                  {user?.displayName || user?.username}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {user?.email}
                </span>
              </div>
              <ChevronUpDownIcon className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width]'
            align='start'
          >
            <DropdownMenuItem onClick={() => {}}>
              <ArrowsRightLeftIcon className='size-4' />
              <span>{t('sidebar.items.switchAccount')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
            >
              <Cog6ToothIcon className='size-4' />
              <span>{t('sidebar.items.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <ArrowLeftStartOnRectangleIcon className='size-4' />
              <span>{t('sidebar.items.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
