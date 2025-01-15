import DiscordIcon from '@/assets/discord-icon.svg';
import { useAuth } from '@/context/AuthContext';
import { AnimatedBeamHome } from '@/components/AnimatedBeamHome';
import { Button } from '@/components/ui/button';
import DotPattern from '@/components/ui/dot-pattern';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ListItem,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/context/ThemeContext';
import { WorkflowNode } from '@/interfaces/Workflows';
import { getLayoutedElements } from '@/utils/workflows';
import {
  Bars3Icon,
  ChevronDownIcon,
  MoonIcon,
  RocketLaunchIcon,
  ServerStackIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
  UserPlusIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import {
  ConnectionLineType,
  ReactFlow,
  Edge,
  MarkerType
} from '@xyflow/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import LinkitLogoFull from '../assets/linkitLogoFull';
import Node from '../components/flow/Node';
import { Helmet } from 'react-helmet';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const team = [
    {
      name: 'Louis Langanay',
      role: t('home.team.roles.frontend'),
      image: '/assets/team/louis.langanay@epitech.eu.jpg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      name: 'Justine Loizel',
      role: t('home.team.roles.frontend'),
      image: '/assets/team/justine.loizel@epitech.eu.jpg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      name: 'Sebastien Bertil-Souchet',
      role: t('home.team.roles.backendAndDevOps'),
      image: '/assets/team/sebastien.bertil-souchet@epitech.eu.jpg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      name: 'Ewen Emeraud',
      role: t('home.team.roles.backend'),
      image: '/assets/team/ewen.emeraud@epitech.eu.jpg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      name: 'Tom Lefoix',
      role: t('home.team.roles.backend'),
      image: '/assets/team/tom.lefoix@epitech.eu.jpg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    }
  ];

  const stack = [
    {
      title: t('home.stack.services.discord.title'),
      description: t('home.stack.services.discord.description'),
      icon: '/assets/stack/discord-icon.svg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      title: t('home.stack.services.outlook.title'),
      description: t('home.stack.services.outlook.description'),
      icon: '/assets/stack/outlook-icon.svg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      title: t('home.stack.services.google.title'),
      description: t('home.stack.services.google.description'),
      icon: '/assets/stack/google-icon.svg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      title: t('home.stack.services.spotify.title'),
      description: t('home.stack.services.spotify.description'),
      icon: '/assets/stack/spotify-icon.svg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      title: t('home.stack.services.youtube.title'),
      description: t('home.stack.services.youtube.description'),
      icon: '/assets/stack/youtube-icon.svg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    },
    {
      title: t('home.stack.services.twitch.title'),
      description: t('home.stack.services.twitch.description'),
      icon: '/assets/stack/twitch-icon.svg',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    }
  ];

  const exampleNodes: WorkflowNode[] = [
    {
      id: '1',
      type: 'node',
      position: { x: 0, y: 0 },
      data: {
        label: 'Twitch Trigger',
        isTrigger: true,
        isValid: true,
        selected: false,
        description: 'Trigger when Squeezie goes live on Twitch.',
        service: {
          id: '1',
          name: 'Twitch',
          image: '/assets/stack/twitch-icon.svg',
          description: 'Twitch is a live streaming platform',
          loginRequired: true
        },
        status: 'success'
      },
    },
    {
      id: '2',
      type: 'node',
      position: { x: 100, y: 0 },
      data: {
        label: 'Send Discord Message',
        isTrigger: false,
        isValid: true,
        selected: false,
        description: 'Send a message to a Discord server on a specific channel.',
        service: {
          id: '2',
          name: 'Discord',
          image: '/assets/stack/discord-icon.svg',
          description: 'Discord is a social media platform',
          loginRequired: true
        },
        status: 'pending'
      },
    },
    {
      id: '3',
      type: 'node',
      position: { x: 200, y: 0 },
      data: {
        label: 'Send Email',
        isTrigger: false,
        isValid: true,
        selected: false,
        description: 'Send an email notification to the Squeezie team.',
        service: {
          id: '3',
          name: 'Gmail',
          image: '/assets/stack/gmail-icon.svg',
          description: 'Email service for notifications',
          loginRequired: true
        }
      },
    },
  ];

  const exampleEdges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    }
  ];

  const MobileNav = () => {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    const toggleSubmenu = (menu: string) => {
      setOpenSubmenu(openSubmenu === menu ? null : menu);
    };

    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={t('home.navigation.menu')}
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-2 pt-10 w-[300px] sm:w-[400px] overflow-y-auto">
          <nav className="flex flex-col">
            <div className="flex flex-col gap-4">
              <div>
                <Button
                  variant="ghost"
                  className="justify-between w-full"
                  onClick={() => toggleSubmenu('features')}
                >
                  {t('home.navigation.features.title')}
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                    openSubmenu === 'features' ? 'rotate-180' : ''
                  }`} />
                </Button>
                {openSubmenu === 'features' && (
                  <div className="mt-2 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('/docs')}
                    >
                      {t('home.navigation.features.intro')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('/pricing')}
                    >
                      {t('home.navigation.features.pricing')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('/integrations')}
                    >
                      {t('home.navigation.features.integrations')}
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Button
                  variant="ghost"
                  className="justify-between w-full"
                  onClick={() => toggleSubmenu('documentation')}
                >
                  {t('home.navigation.documentation.title')}
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                    openSubmenu === 'documentation' ? 'rotate-180' : ''
                  }`} />
                </Button>
                {openSubmenu === 'documentation' && (
                  <div className="mt-2 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('/api-docs')}
                    >
                      {t('home.navigation.documentation.api')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('https://github.com/LouisLanganay/AREA')}
                    >
                      {t('home.navigation.documentation.source')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('/client.apk')}
                    >
                      {t('home.navigation.documentation.mobile')}
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Button
                  variant="ghost"
                  className="justify-between w-full"
                  onClick={() => toggleSubmenu('enterprise')}
                >
                  {t('home.navigation.enterprise.title')}
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                    openSubmenu === 'enterprise' ? 'rotate-180' : ''
                  }`} />
                </Button>
                {openSubmenu === 'enterprise' && (
                  <div className="mt-2 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('/enterprise')}
                    >
                      {t('home.navigation.enterprise.solutions')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('/case-studies')}
                    >
                      {t('home.navigation.enterprise.cases')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start truncate"
                      onClick={() => navigate('/contact')}
                    >
                      {t('home.navigation.enterprise.contact')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex flex-col gap-2">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    className="justify-start truncate"
                    onClick={() => navigate('/login')}
                  >
                    <UserIcon className="h-5 w-5" />
                    {t('home.auth.signin')}
                  </Button>
                  <Button
                    className="justify-start truncate"
                    onClick={() => navigate('/register')}
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    {t('home.auth.register')}
                  </Button>
                </>
              ) : (
                <Button
                  className="justify-start truncate"
                  onClick={() => navigate('/workflows')}
                >
                  {t('home.auth.dashboard')}
                </Button>
              )}
              <Button
                variant="ghost"
                className="justify-start truncate"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label={theme === 'light' ? t('home.theme.toggleDark') : t('home.theme.toggleLight')}
              >
                {theme === 'light' ? (
                  <><MoonIcon className="h-5 w-5" />{t('home.theme.dark')}</>
                ) : (
                  <><SunIcon className="h-5 w-5" />{t('home.theme.light')}</>
                )}
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <div className='min-h-screen bg-background'>
      <Helmet>
        <meta name="description" content={t('home.description')} />
      </Helmet>

      <header className='border-b z-40'>
        <div className='container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto'>
          <div className='flex-1 basis-0 items-center w-24 h-full justify-start flex'>
            <Link
              to='/'
              className='h-full flex items-center'
              aria-label={t('home.navigation.logo')}
            >
              <LinkitLogoFull className='w-24 h-fit object-contain fill-primary' />
            </Link>
          </div>

          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>{t('home.navigation.features.title')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
                    <li className='row-span-3'>
                      <NavigationMenuLink asChild>
                        <a className='flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md' href='/'>
                          <div className='h-8 w-8 rounded bg-primary/20'></div>
                          <div className='mb-2 mt-4 text-lg font-medium'>LinkIt</div>
                          <p className='text-sm leading-tight text-muted-foreground'>
                            {t('home.navigation.features.description')}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem
                      href='#features'
                      title={t('home.navigation.features.title')}
                      aria-label={t('home.navigation.features.linkLabel')}
                    >
                      {t('home.navigation.features.intro')}
                    </ListItem>
                    <ListItem
                      href='#team'
                      title={t('home.navigation.features.team')}
                      aria-label={t('home.navigation.features.teamLinkLabel')}
                    >
                      {t('home.navigation.features.teamDescription')}
                    </ListItem>
                    <ListItem
                      href='#stack'
                      title={t('home.navigation.features.stack')}
                      aria-label={t('home.navigation.features.stackLinkLabel')}
                    >
                      {t('home.navigation.features.stackDescription')}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>{t('home.navigation.documentation.title')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid gap-3 p-4 w-[400px]'>
                    <ListItem href='https://github.com/LouisLanganay/AREA' title='Source Code'>
                      {t('home.navigation.documentation.source')}
                    </ListItem>
                    <ListItem href='/client.apk' title='Mobile App'>
                      {t('home.navigation.documentation.mobile')}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className='hidden md:flex flex-1 basis-0 items-center gap-4 justify-end'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? t('home.theme.toggleDark') : t('home.theme.toggleLight')}
            >
              {theme === 'light' ? (
                <MoonIcon className='h-5 w-5' />
              ) : (
                <SunIcon className='h-5 w-5' />
              )}
            </Button>
            {!isAuthenticated ? (
              <>
                <Button
                  variant='outline'
                  onClick={() => navigate('/login')}
                >
                  {t('home.auth.signin')}
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                >
                  {t('home.auth.register')}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/workflows')}
              >
                {t('home.auth.dashboard')}
              </Button>
            )}
          </div>

          <MobileNav />
        </div>
      </header>

      <div className='px-4 sm:px-5 md:px-12 lg:px-24 relative'>
        <DotPattern className='absolute inset-x-0 h-[calc(100vh)] [mask-image:linear-gradient(to_bottom,white,white,transparent_100%)] opacity-50 dark:opacity-20' />

        <section id="hero" className='container w-full h-full max-w-6xl mx-auto min-h-[300px] py-40 relative flex flex-row justify-between'>
          <div className=''>
            <div className='flex flex-col'>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-7xl'>
                {t('home.title.automate')}
              </h1>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-7xl'>
                {t('home.title.scale')}
              </h1>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-7xl'>
                {t('home.title.iterate')}
              </h1>
            </div>
            <p className='mt-8 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8 max-w-lg'
              dangerouslySetInnerHTML={{ __html: t('home.description') }}
              suppressHydrationWarning={true}
            />
          </div>
          <div className='w-[385px] h-[calc(100vh-300px)] hidden md:flex'>
            <div className='w-[385px] h-full'>
              <ReactFlow
                nodes={getLayoutedElements(exampleNodes, exampleEdges, 'TB').nodes}
                edges={getLayoutedElements(exampleNodes, exampleEdges, 'TB').edges as Edge[]}
                nodeTypes={{node: Node}}
                nodesConnectable={false}
                nodesDraggable={false}
                panOnDrag={false}
                viewport={{ x: 10, y: 0, zoom: 1.1 }}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
              >
              </ReactFlow>
            </div>
          </div>
        </section>

        <section id="features" className='container w-full h-full max-w-6xl mx-auto py-10 sm:py-20 md:py-32 lg:py-40'>
          <h2 className='text-center text-base/7 font-semibold text-primary'>
            {t('home.features.title')}
          </h2>
          <p className='mx-auto mt-2 max-w-2xl text-balance text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
            {t('home.features.subtitle')}
          </p>
          <div className='mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2'>
            <div className='relative lg:row-span-2'>
              <div className='absolute inset-px rounded-lg bg-card border lg:rounded-l-[2rem]'></div>
              <div className='relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]'>
                <div className='px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10'>
                  <p className='mt-2 text-lg font-medium tracking-tight text-foreground max-lg:text-center'>
                    {t('home.features.mobile.title')}
                  </p>
                  <p className='mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center'>
                    {t('home.features.mobile.description')}
                  </p>
                </div>
                <div className='relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm'>
                  <div className='absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-muted-foreground/20 shadow-2xl'>
                    <img
                      className='size-full object-cover object-top'
                      src='/assets/phone.png'
                      alt={t('home.features.mobile.imageAlt')}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='relative max-lg:row-start-1 inset-px rounded-lg bg-card max-lg:rounded-t-[2rem] border'>
              <div className='relative flex min-h-72 h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]'>
                <div className='px-8 pt-8 sm:px-10 sm:pt-10'>
                  <p className='mt-2 text-lg font-medium tracking-tight text-foreground max-lg:text-center'>
                    {t('home.features.performance.title')}
                  </p>
                  <p className='mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center'>
                    {t('home.features.performance.description')}
                  </p>
                </div>
                <div className='flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2 overflow-hidden mt-20'>
                  <div className='border border-primary/20 bg-primary/10 rounded-lg absolute -bottom-1 -right-7 max-w-[350px]'>
                    <div className='relative h-full w-full'>
                      <div className="absolute bottom-full left-16 -mb-px flex h-8 items-end overflow-hidden">
                        <div className="flex -mb-px h-[2px] w-56">
                          <div className="w-full flex-none bg-border-gradient-ai blur-xs"></div>
                          <div className="-ml-[100%] w-full flex-none bg-border-gradient-ai blur-[10px] h-[20px]"></div>
                        </div>
                      </div>
                      <h3 className='font-medium text-sm flex flex-row gap-2 items-center pt-4 px-4'>
                        <SparklesIcon className='size-4 text-primary' />
                        <span className='bg-clip-text text-transparent bg-text-gradient-ai'>
                          {t('home.features.performance.ai.title')}
                        </span>
                      </h3>
                      <p className='text-sm text-muted-foreground mt-2 pb-4 px-4'>
                        {t('home.features.performance.ai.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='relative max-lg:row-start-2'>
              <div className='absolute inset-px rounded-lg bg-card border lg:rounded-tr-[2rem]'></div>
              <div className='relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]'>
                <div className='px-8 pt-8 sm:px-10 sm:pt-10'>
                  <p className='mt-2 text-lg font-medium tracking-tight text-foreground max-lg:text-center'>
                    {t('home.features.scalability.title')}
                  </p>
                  <p className='mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center'>
                    {t('home.features.scalability.description')}
                  </p>
                </div>
                <div className='flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2 overflow-hidden mt-32'>
                  <div className='w-[400px] bg-muted/50 p-4 border-l border-t rounded-lg absolute -bottom-7 -right-8 max-w-[350px]'>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div className='p-1 rounded-md bg-muted border overflow-hidden shrink-0'>
                            <img
                              src={DiscordIcon}
                              alt={t('home.features.scalability.sidebar.discord')}
                              className='size-5 object-contain'
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          <div className='font-medium text-sm text-foreground'>
                            {t('home.features.scalability.sidebar.title')}
                          </div>
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          className='p-1 h-auto'
                          aria-label={t('home.features.scalability.sidebar.close')}
                        >
                          <XMarkIcon className='w-4 h-4' />
                        </Button>
                      </div>
                      <div className='space-y-2'>
                        <div className='space-y-4'>
                          <div className='space-y-4 bg-card border rounded-lg p-4 shadow-sm'>
                            <div className='flex items-center gap-2'>
                              <div className='p-1 min-w-6 min-h-6 rounded-full bg-muted border overflow-hidden'>
                                <ServerStackIcon className='size-5 object-contain' />
                              </div>
                              <p className='text-sm font-semibold'>{t('home.features.scalability.sidebar.titleGroup')}</p>
                            </div>
                            <div className='space-y-1'>
                              <Label htmlFor="serverName" className='flex items-center gap-1'>
                                {t('home.features.scalability.sidebar.label')} <span className='text-sm text-destructive'>*</span>
                              </Label>
                              <Input
                                id="serverName"
                                variantSize='sm'
                                type='text'
                                required={true}
                                aria-required="true"
                                aria-label={t('home.features.scalability.sidebar.label')}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2 lg:col-span-2'>
              <div className='absolute inset-px rounded-lg bg-card border lg:rounded-br-[2rem]'></div>
              <div className='relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]'>
                <div className='px-8 pt-8 sm:px-10 sm:pt-10'>
                  <p className='mt-2 text-lg font-medium tracking-tight text-foreground max-lg:text-center'>
                    {t('home.features.connect.title')}
                  </p>
                  <p className='mt-2 text-sm/6 text-muted-foreground max-lg:text-center'>
                    {t('home.features.connect.description')}
                  </p>
                </div>
                <div className='flex flex-1 items-center [container-type:inline-size]'>
                  <AnimatedBeamHome className='w-full' />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="team" className='container w-full h-full max-w-6xl mx-auto py-10 sm:py-20 md:py-32 lg:py-40'>
          <div className='mx-auto grid gap-20 xl:grid-cols-3'>
            <div className='max-w-xl'>
              <h2 className='text-pretty text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground/60 to-foreground sm:text-4xl'>
                {t('home.team.title')}
              </h2>
              <p className='mt-6 text-lg/8 text-muted-foreground'>
                {t('home.team.description')}
              </p>
            </div>
            <ul role='list' className='grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2'>
              {team.map((person) => (
                <li key={person.name}>
                  <div className='flex items-center gap-x-6'>
                    <img
                      className='size-16 rounded-full object-cover'
                      src={person.image}
                      alt={person.name}
                      loading={person.loading}
                      decoding={person.decoding}
                    />
                    <div>
                      <h3 className='text-base/7 font-semibold tracking-tight text-foreground'>{person.name}</h3>
                      <p className='text-sm/6 font-semibold text-primary'>{person.role}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="stack" className='container w-full h-full max-w-6xl mx-auto py-10 sm:py-20 md:py-32 lg:py-40'>
          <div className='flex flex-col sm:flex-row justify-between gap-4'>
            <h2 className='text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl max-w-md'>
              <span className='bg-clip-text text-transparent bg-gradient-to-b from-foreground/60 to-foreground'>{t('home.stack.title1')} </span>{t('home.stack.title2')}
            </h2>
            <p className='text-lg sm:text-xl text-foreground font-medium max-w-md'>
              {t('home.stack.description')}
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16'>
            {stack.map((item) => (
              <div key={item.title} className='flex flex-row gap-4 border rounded-lg p-4 shadow-sm hover:scale-101 transition-transform duration-300'>
                <div className='shrink-0 size-12 p-2 border rounded-lg flex items-center justify-center'>
                  <img
                    src={item.icon}
                    alt={item.title}
                    className='w-full h-full object-contain'
                    loading={item.loading}
                    decoding={item.decoding}
                  />
                </div>
                <div className='flex flex-col flex-1 min-w-0'>
                  <span className='text-md font-semibold truncate'>{item.title}</span>
                  <p className='text-sm text-muted-foreground'>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="cta" className='container w-full h-full max-w-6xl mx-auto py-10 sm:py-20 md:py-32 lg:py-40'>
          <div className='flex flex-col justify-center gap-4 items-center text-center'>
            <h2 className='text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-5xl max-w-xl'>
              <span className='bg-clip-text text-transparent bg-gradient-to-b from-foreground/60 to-foreground'>
                {t('home.cta.title1')}
              </span> {' '}{t('home.cta.title2')}
            </h2>
            <p className='text-lg sm:text-xl text-foreground font-medium max-w-md'>
              {t('home.cta.description')}
            </p>
            <Button
              variant='outline'
              size='lg'
              className='w-full sm:w-auto'
              onClick={() => navigate('/workflows')}
            >
              {t('home.cta.button')}
              <RocketLaunchIcon className='w-4 h-4' />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
