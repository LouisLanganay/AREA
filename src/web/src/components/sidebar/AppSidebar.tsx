import { useAuth } from '@/auth/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserInfo } from './UserInfo';
import {
  CursorArrowRaysIcon,
  HomeIcon,
  Squares2X2Icon,
  UsersIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

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
  },
  {
    title: t('sidebar.items.settings'),
    items: [
      {
        title: t('sidebar.items.settings'),
        icon: Cog6ToothIcon,
        url: '/settings'
      }
    ]
  }
];

export function AppSidebar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const groups = getGroups(t);

  return (
    <Sidebar>
      <SidebarHeader>
        <UserInfo
          user={user}
        />
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
    </Sidebar>
  );
}
