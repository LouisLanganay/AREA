import { useAuth } from '@/auth/AuthContext'
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
} from '@/components/ui/sidebar'
import { UserInfo } from './UserInfo'
import { Cog6ToothIcon,
  HomeIcon,
  Squares2X2Icon,
  UsersIcon
} from '@heroicons/react/24/solid';

const groups = [
  {
    title: 'Application',
    items: [
      {
        title: 'Home',
        icon: HomeIcon,
        url: '/'
      },
      {
        title: 'My Workflows',
        icon: Squares2X2Icon,
        url: '/workflows'
      }
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Users',
        icon: UsersIcon,
        url: '/users'
      }
    ],
    isAdmin: true
  }
]

export function AppSidebar() {
  const { user } = useAuth();

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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Cog6ToothIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
