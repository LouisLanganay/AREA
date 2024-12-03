import { useAuth } from '@/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ArrowLeftStartOnRectangleIcon, ArrowsRightLeftIcon, ChevronUpDownIcon, Cog6ToothIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User } from '../../../../shared/Users';
import { Badge } from '../ui/badge';

export function UserInfo({
  user,
}: {
  user: User | null
}) {
  const { logout, accounts, switchAccount, isCurrentAccount } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const addAccount = () => {
    navigate('/login');
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className={clsx(
                'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border',
                'min-w-0'
              )}
            >
              <div className='flex-shrink-0 flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden'>
                {user?.avatarUrl ? (
                  <img
                    src={user?.avatarUrl}
                    alt={user?.username}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex items-center justify-center bg-sidebar-accent text-sidebar-accent-foreground size-8'>
                    <span className='text-xs'>
                      {user?.username.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className='flex flex-col gap-0.5 leading-none min-w-0'>
                <span className='font-semibold truncate'>
                  {user?.displayName || user?.username}
                </span>
                <span className='text-xs text-muted-foreground truncate'>
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger onClick={() => {}}>
                <ArrowsRightLeftIcon className='size-4' />
                <span>{t('sidebar.items.switchAccount')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {accounts.map((account) => (
                    <DropdownMenuItem
                      key={account.token}
                      onClick={() => switchAccount(account.token)}
                      className='justify-between min-w-[--radix-dropdown-menu-trigger-width]'
                      disabled={isCurrentAccount(account.token)}
                    >
                      <div className='flex items-center gap-2'>
                        <div className='flex-shrink-0 flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden'>
                          {account.user?.avatarUrl ? (
                            <img
                              src={account.user?.avatarUrl}
                              alt={account.user?.username}
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <span>{account.user?.username.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        {account.user?.displayName || account.user?.username}
                      </div>
                      {isCurrentAccount(account.token) && (
                        <Badge variant='outline'>
                          {t('sidebar.items.currentAccount')}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                  {accounts.length > 0 && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem onClick={() => addAccount()}>
                    <PlusIcon className='size-4' />
                    <span>{t('sidebar.items.addAccount')}</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
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
