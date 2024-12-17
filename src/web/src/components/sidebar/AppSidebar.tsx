import { useAuth } from '@/auth/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  CursorArrowRaysIcon,
  HomeIcon,
  LifebuoyIcon,
  Squares2X2Icon,
  UsersIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import LinkitLogoFull from '../../assets/linkitLogoFull';
import { UserInfo } from './UserInfo';

const getGroups = (t: (key: string) => string) => [
  {
    title: t('sidebar.groups.application'),
    items: [
      {
        title: t('sidebar.items.home'),
        icon: HomeIcon,
        url: '/'
      },
      {
        title: t('sidebar.items.workflows'),
        icon: Squares2X2Icon,
        url: '/workflows'
      },
      {
        title: t('sidebar.items.services'),
        icon: CursorArrowRaysIcon,
        url: '/services'
      }
    ]
  },
  {
    title: t('sidebar.groups.administration'),
    items: [
      {
        title: t('sidebar.items.users'),
        icon: UsersIcon,
        url: '/users'
      }
    ],
    isAdmin: true
  }
];

export function AppSidebar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const groups = getGroups(t);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center px-2 pt-2'>
          <LinkitLogoFull className='w-24 h-fit object-contain fill-foreground' />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem className='list-none'>
          <SidebarMenuButton asChild>
            <a href='https://github.com/LouisLanganay/AREA'>
              <LifebuoyIcon className='w-5 h-5' />
              <span>{t('sidebar.items.documentation')}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <UserInfo
          user={user}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
