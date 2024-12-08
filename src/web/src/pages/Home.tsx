import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ListItem,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Link } from 'react-router-dom';
import { AnimatedBeamHome } from '@/components/AnimatedBeamHome';
import DotPattern from '@/components/ui/dot-pattern';
import {
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/solid';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const team = [
    {
      name: 'Louis Langanay',
      role: t('home.team.roles.frontend'),
      image: '/assets/team/louis.langanay@epitech.eu.jpg'
    },
    {
      name: 'Justine Loizel',
      role: t('home.team.roles.frontend'),
      image: '/assets/team/justine.loizel@epitech.eu.jpg'
    },
    {
      name: 'Sebastien Bertil-Souchet',
      role: t('home.team.roles.backendAndDevOps'),
      image: '/assets/team/sebastien.bertil-souchet@epitech.eu.jpg'
    },
    {
      name: 'Ewen Emeraud',
      role: t('home.team.roles.backend'),
      image: '/assets/team/ewen.emeraud@epitech.eu.jpg'
    },
    {
      name: 'Tom Lefoix',
      role: t('home.team.roles.backend'),
      image: '/assets/team/tom.lefoix@epitech.eu.jpg'
    }
  ]

  const stack = [
    {
      title: t('home.stack.services.discord.title'),
      description: t('home.stack.services.discord.description'),
      icon: '/assets/stack/discord-icon.svg'
    },
    {
      title: t('home.stack.services.apple.title'),
      description: t('home.stack.services.apple.description'),
      icon: '/assets/stack/apple-icon.svg'
    },
    {
      title: t('home.stack.services.google.title'),
      description: t('home.stack.services.google.description'),
      icon: '/assets/stack/google-icon.svg'
    },
    {
      title: t('home.stack.services.github.title'),
      description: t('home.stack.services.github.description'),
      icon: '/assets/stack/github-icon.svg'
    },
    {
      title: t('home.stack.services.youtube.title'),
      description: t('home.stack.services.youtube.description'),
      icon: '/assets/stack/youtube-icon.svg'
    },
    {
      title: t('home.stack.services.twitch.title'),
      description: t('home.stack.services.twitch.description'),
      icon: '/assets/stack/twitch-icon.svg'
    }
  ]

  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b z-40'>
        <div className='container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto'>
          <div className='flex-1 basis-0 flex items-center'>
            <div className='h-8 w-8 rounded bg-primary/20'>
              <Link to='/'>LinkIt</Link>
            </div>
          </div>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>{t('home.navigation.features.title')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
                    <li className='row-span-3'>
                      <NavigationMenuLink asChild>
                        <a className='flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md' href='/'>
                          <div className='h-8 w-8 rounded bg-primary/20'></div>
                          <div className='mb-2 mt-4 text-lg font-medium'>LinkIt</div>
                          <p className='text-sm leading-tight text-muted-foreground'>
                            {t('home.navigation.features.description')}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href='/docs' title={t('home.navigation.features.title')}>
                      {t('home.navigation.features.intro')}
                    </ListItem>
                    <ListItem href='/pricing' title='Pricing'>
                      {t('home.navigation.features.pricing')}
                    </ListItem>
                    <ListItem href='/integrations' title='Integrations'>
                      {t('home.navigation.features.integrations')}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>{t('home.navigation.documentation.title')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid gap-3 p-6 w-[400px]'>
                    <ListItem href='/api-docs' title='API Reference'>
                      {t('home.navigation.documentation.api')}
                    </ListItem>
                    <ListItem href='/github' title='Source Code'>
                      {t('home.navigation.documentation.source')}
                    </ListItem>
                    <ListItem href='/mobile' title='Mobile App'>
                      {t('home.navigation.documentation.mobile')}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>{t('home.navigation.enterprise.title')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid gap-3 p-6 w-[400px]'>
                    <ListItem href='/enterprise' title='Enterprise Solutions'>
                      {t('home.navigation.enterprise.solutions')}
                    </ListItem>
                    <ListItem href='/case-studies' title='Case Studies'>
                      {t('home.navigation.enterprise.cases')}
                    </ListItem>
                    <ListItem href='/contact' title='Contact Sales'>
                      {t('home.navigation.enterprise.contact')}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className='flex-1 basis-0 flex items-center gap-4 justify-end'>
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
          </div>
        </div>
      </header>

      <div className='px-2 sm:px-5 md:px-12 lg:px-24 relative'>
        <DotPattern className='absolute inset-x-0 h-[calc(100vh)] [mask-image:linear-gradient(to_bottom,white,white,transparent_100%)] opacity-50' />
        <section className='container w-full h-full max-w-6xl mx-auto min-h-[300px] py-10 sm:py-20 md:py-32 lg:py-40 relative'>
          <div className='hidden sm:mb-8 sm:flex'>
            <div
              onClick={() => navigate('/client.apk')}
              className='group cursor-pointer relative flex items-center gap-2 flex-row rounded-full px-2 py-1 text-sm/6 text-gray-600 ring-1 ring-for/10 hover:ring-for/20 bg-muted'
            >
              <div className='flex items-center gap-2 bg-primary/20 rounded-full p-1'>
                <DevicePhoneMobileIcon className='w-4 h-4' />
              </div>
              {t('home.mobile.discover')}
              <ArrowRightIcon className='w-4 h-4 group-hover:translate-x-0.5 transition-transform' />
            </div>
          </div>
          <div className=''>
            <div className='flex flex-col'>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-for sm:text-7xl'>
                {t('home.title.automate')}
              </h1>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-for sm:text-7xl'>
                {t('home.title.scale')}
              </h1>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-for sm:text-7xl'>
                {t('home.title.iterate')}
              </h1>
            </div>
            <p className='mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8 max-w-lg'>
              {t('home.description')}
            </p>
          </div>
        </section>
        <section className='container w-full h-full max-w-6xl mx-auto py-10 sm:py-20 md:py-32 lg:py-40'>
          <h2 className='text-center text-base/7 font-semibold text-primary'>
            {t('home.features.title')}
          </h2>
          <p className='mx-auto mt-2 max-w-2xl text-balance text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
            {t('home.features.subtitle')}
          </p>
          <div className='mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2'>
            <div className='relative lg:row-span-2'>
              <div className='absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]'></div>
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
                  <div className='absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-for shadow-2xl'>
                    <img className='size-full object-cover object-top' src='https://tailwindui.com/plus/img/component-images/bento-03-mobile-friendly.png' alt=''/>
                  </div>
                </div>
              </div>
              <div className='pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]'></div>
            </div>
            <div className='relative max-lg:row-start-1'>
              <div className='absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]'></div>
              <div className='relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]'>
                <div className='px-8 pt-8 sm:px-10 sm:pt-10'>
                  <p className='mt-2 text-lg font-medium tracking-tight text-foreground max-lg:text-center'>
                    {t('home.features.performance.title')}
                  </p>
                  <p className='mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center'>
                    {t('home.features.performance.description')}
                  </p>
                </div>
                <div className='flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2'>
                  <img className='w-full max-lg:max-w-xs' src='https://tailwindui.com/plus/img/component-images/bento-03-performance.png' alt=''/>
                </div>
              </div>
              <div className='pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]'></div>
            </div>
            <div className='relative max-lg:row-start-2'>
              <div className='absolute inset-px rounded-lg bg-white'></div>
              <div className='relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]'>
                <div className='px-8 pt-8 sm:px-10 sm:pt-10'>
                  <p className='mt-2 text-lg font-medium tracking-tight text-foreground max-lg:text-center'>
                    {t('home.features.scalability.title')}
                  </p>
                  <p className='mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center'>
                    {t('home.features.scalability.description')}
                  </p>
                </div>
                <div className='flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2'>
                  <img className='w-full max-lg:max-w-xs' src='https://tailwindui.com/plus/img/component-images/bento-03-performance.png' alt=''/>
                </div>
              </div>
              <div className='pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5'></div>
            </div>
            <div className='relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2 lg:col-span-2'>
              <div className='absolute inset-px rounded-lg bg-white'></div>
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
              <div className='pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5'></div>
            </div>
          </div>
        </section>
        <section className='container w-full h-full max-w-6xl mx-auto py-10 sm:py-20 md:py-32 lg:py-40'>
          <div className='mx-auto grid gap-20 xl:grid-cols-3'>
            <div className='max-w-xl'>
              <h2 className='text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
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
                    <img className='size-16 rounded-full object-cover' src={person.image} alt={person.name} />
                    <div>
                      <h3 className='text-base/7 font-semibold tracking-tight text-foreground'>{person.name}</h3>
                      <p className='text-sm/6 font-semibold text-indigo-600'>{person.role}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='container w-full h-full max-w-6xl mx-auto py-10 sm:py-20 md:py-32 lg:py-40'>
          <div className='flex flex-col sm:flex-row justify-between gap-4'>
            <h2 className='text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl max-w-md'>
              <span className='text-muted-foreground'>{t('home.stack.title1')} </span>{t('home.stack.title2')}
            </h2>
            <p className='text-lg sm:text-xl text-foreground font-medium max-w-md'>
              {t('home.stack.description')}
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16'>
            {stack.map((item) => (
              <div className='flex flex-row gap-4 border rounded-xl p-4 shadow-sm hover:scale-101 transition-transform duration-300'>
                <div className='shrink-0 size-12 p-2 border rounded-lg flex items-center justify-center'>
                  <img src={item.icon} alt={item.title} className='w-full h-full object-contain' />
                </div>
                <div className='flex flex-col flex-1 min-w-0'>
                  <span className='text-md font-semibold truncate'>{item.title}</span>
                  <p className='text-sm text-muted-foreground'>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='container w-full h-full max-w-6xl mx-auto py-10 sm:py-20 md:py-32 lg:py-40'>
          <div className='flex flex-col justify-center gap-4 items-center text-center'>
            <h2 className='text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-5xl max-w-xl'>
              <span className='text-muted-foreground'>{t('home.cta.title1')} </span>{t('home.cta.title2')}
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
