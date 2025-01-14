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
  UsersIcon,
  FolderIcon,
  DocumentIcon,
  PlusIcon,
  FolderOpenIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import LinkitLogoFull from '../../assets/linkitLogoFull';
import { UserInfo } from './UserInfo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useEffect, useState } from 'react';
import { getWorkflows } from '@/api/Workflows';
import { Workflow } from '@/interfaces/Workflows';
import { useNavigate, useLocation } from 'react-router-dom';
import { getWorkflowName, groupWorkflowsByFolder } from '@/utils/workflowPath';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { Button } from '../ui/button';
import { QuestionMarkCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { isAdmin } from '@/api/User';

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

interface WorkflowGroup {
  [key: string]: Workflow[];
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
  const [workflowGroups, setWorkflowGroups] = useState<WorkflowGroup>({});
  const navigate = useNavigate();
  const location = useLocation();
  const [isPremiumBannerVisible, setIsPremiumBannerVisible] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!token) return;
      try {
        const workflows = await getWorkflows(token);
        const groups = groupWorkflowsByFolder(workflows);
        setWorkflowGroups(groups);
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      }
    };

    const fetchIsAdmin = async () => {
      if (!token) return;
      try {
        const result = await isAdmin(token);
        setUserIsAdmin(result.isAdmin);
      } catch (error) {
        console.error('Failed to fetch isAdmin:', error);
      }
    };

    fetchWorkflows();
    fetchIsAdmin();
  }, [token]);

  useEffect(() => {
    const bannerHidden = Cookies.get('premium-banner-hidden');
    if (bannerHidden) {
      setIsPremiumBannerVisible(false);
    }
  }, []);

  const hidePremiumBanner = () => {
    setIsPremiumBannerVisible(false);
    Cookies.set('premium-banner-hidden', 'true', { expires: 1 }); // 1 day expiration
  };

  const renderWorkflowItems = (_: string, workflows: Workflow[]) => {
    return workflows.map((workflow) => (
      <SidebarMenuSubItem
        key={workflow.id}
        onClick={() => navigate(`/workflows/${workflow.id}`)}
        className={clsx(
          'transition-colors text-nowrap overflow-hidden duration-200 flex flex-row items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          location.pathname === `/workflows/${workflow.id}` ? '!bg-sidebar-border !text-sidebar-accent-foreground' : ''
        )}
      >
        <DocumentIcon className='size-4 flex-shrink-0' />
        {getWorkflowName(workflow.name)}
      </SidebarMenuSubItem>
    ));
  };

  const handleOnboarding = () => {
    Cookies.remove('onboarding-completed');
    window.location.reload();
  };

  const renderFolderStructure = () => {
    return Object.entries(workflowGroups).map(([path, workflows]) => {
      if (!path) {
        // Root workflows
        return (
          <SidebarMenuSub key="root">
            {renderWorkflowItems('', workflows)}
          </SidebarMenuSub>
        );
      }

      const pathParts = path.split('/');
      // Folder with workflows
      return (
        <SidebarMenuSub key={path}>
          <Collapsible defaultOpen className='group/subfolder'>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <FolderIcon className={clsx(
                  'size-3 flex-shrink-0 block',
                  'group-data-[state=open]/subfolder:hidden'
                )} />
                <FolderOpenIcon className={clsx(
                  'size-3 flex-shrink-0 hidden',
                  'group-data-[state=open]/subfolder:block'
                )} />
                <span>{pathParts[pathParts.length - 1]}</span>
                <ChevronRightIcon className='size-3 ml-auto transition-transform duration-200 group-data-[state=open]/subfolder:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className='ml-3.5 mt-1'>
              {renderWorkflowItems(path, workflows)}
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuSub>
      );
    });
  };

  const groups = getGroups(t, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center px-2 pt-2 cursor-pointer' onClick={() => navigate('/')}>
          <LinkitLogoFull className='w-24 h-fit object-contain fill-foreground' />
        </div>
      </SidebarHeader>
      <SidebarContent data-onboarding="sidebar">
        {groups.map((group) => (
          <SidebarGroup key={group.title} className={clsx(
            group.isAdmin === true && userIsAdmin !== true && 'hidden'
          )}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.title === t('sidebar.items.workflows') ? (
                      <Collapsible defaultOpen className='group/collapsible'>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {renderFolderStructure()}
                          <SidebarMenuButton
                            onClick={() => navigate('/workflows?new=true')}
                          >
                            <PlusIcon className='size-3' />
                            <span>{t('sidebar.items.newWorkflow')}</span>
                          </SidebarMenuButton>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        onClick={() => navigate(item.url)}
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
        <div className='flex flex-col' data-onboarding="sidebar-footer">
          {isPremiumBannerVisible && (
            <div className='p-3 rounded-lg border border-primary/20 bg-primary/10 relative group/premium-banner overflow-hidden'>
              <div className="absolute inset-0 z-0">
                <div className="absolute bg-second/70 size-16 rounded-full blur-2xl animate-blob" />
                <div className="absolute inset-[90%] bg-primary size-14 rounded-full blur-2xl animate-blob animation-delay-2000" />
              </div>
              <div className="relative z-10">
                <button
                  onClick={hidePremiumBanner}
                  aria-label={t('common.close')}
                  className='absolute right-0 top-0 p-1 rounded-md hover:bg-second-bis/20 transition-all duration-200 group-hover/premium-banner:opacity-100 md:opacity-0'
                >
                  <XMarkIcon className='size-3 text-primary' />
                </button>
                <div className='flex items-center gap-2 mb-2'>
                  <SparklesIcon className='size-4 text-primary' />
                  <span className='text-sm font-medium text-primary'>
                    {t('sidebar.premium.title')}
                  </span>
                </div>
                <p className='text-sm bg-clip-text text-transparent bg-text-gradient-ai'>
                  {t('sidebar.premium.description')}
                </p>
                <Button
                  variant='ia'
                  size='xs'
                  onClick={() => navigate('/premium')}
                  className='mt-2 w-full group/button'
                >
                  {t('sidebar.premium.button')}
                  <RocketLaunchIcon className='size-3 transition-transform duration-300 group-hover/button:-translate-y-1 group-hover/button:translate-x-1 group-hover/button:rotate-12' />
                </Button>
              </div>
            </div>
          )}
        </div>
        <ul className='list-none'>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href='https://github.com/LouisLanganay/AREA'>
                <LifebuoyIcon className='w-5 h-5' />
                <span>{t('sidebar.items.documentation')}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button onClick={() => handleOnboarding()}>
                <QuestionMarkCircleIcon className='size-4' />
                <span>{t('sidebar.items.onboarding')}</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </ul>
        <UserInfo
          user={user}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
