import { useAuth } from '@/context/AuthContext';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  ChevronRightIcon,
  CursorArrowRaysIcon,
  HomeIcon,
  LifebuoyIcon,
  Squares2X2Icon,
  UsersIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import LinkitLogoFull from '../../assets/linkitLogoFull';
import { UserInfo } from './UserInfo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useEffect, useState } from 'react';
import { getWorkflows } from '@/api/Workflows';
import { Workflow } from '@/interfaces/Workflows';
import { useNavigate } from 'react-router-dom';

interface SubItem {
  title: string;
  url: string;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType;
  url: string;
  subItems?: SubItem[];
}

interface GroupItem {
  title: string;
  items: MenuItem[];
  isAdmin?: boolean;
}

interface WorkflowSubItem {
  title: string;
  url: string;
}

const getGroups = (t: (key: string) => string, workflowItems: WorkflowSubItem[]): GroupItem[] => [
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
        url: '/workflows',
        subItems: workflowItems
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
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [workflowItems, setWorkflowItems] = useState<WorkflowSubItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!token) return;
      try {
        const workflows = await getWorkflows(token);
        const items = workflows.map(workflow => ({
          title: workflow.name,
          url: `/workflows/${workflow.id}`
        }));
        setWorkflowItems(items);
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      }
    };

    fetchWorkflows();
  }, [token]);

  const groups = getGroups(t, workflowItems);

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
                    {item.subItems ? (
                      <Collapsible defaultOpen className='group/collapsible'>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem
                                key={subItem.title}
                                onClick={() => {
                                  navigate(subItem.url);
                                }}
                                className='px-2 py-1.5 rounded-md cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              >
                                {subItem.title}
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        onClick={() => {
                          navigate(item.url);
                        }}
                      >
                        <div>
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    )}
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
