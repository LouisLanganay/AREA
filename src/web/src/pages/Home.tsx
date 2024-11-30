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
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { AnimatedBeamHome } from '@/components/AnimatedBeamHome';
import DotPattern from '@/components/ui/dot-pattern';
import { ArrowRightIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b z-40'>
        <div className='container flex h-16 items-center justify-between px-4 max-w-6xl mx-auto'>
          <div className='flex items-center'>
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

          <div className='flex items-center gap-4'>
            <Button variant='outline' onClick={() => navigate('/login')}>
              {t('home.auth.signin')}
            </Button>
            <Button onClick={() => navigate('/register')}>
              {t('home.auth.register')}
            </Button>
          </div>
        </div>
      </header>

      <div className='px-2 sm:px-5 md:px-12 lg:px-24 relative'>
        <DotPattern className='[mask-image:linear-gradient(to_bottom,white,white,white,white,white,transparent)] opacity-50' />
        <section className='container w-full h-full max-w-4xl mx-auto min-h-[300px] py-10 sm:py-20 md:py-32 lg:py-40 relative'>
          <div className='hidden sm:mb-8 sm:flex'>
            <div
              onClick={() => navigate('/client.apk')}
              className='cursor-pointer relative flex items-center gap-2 flex-row rounded-full px-2 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20'
            >
              <div className='flex items-center gap-2 bg-primary/20 rounded-full p-1'>
                <DevicePhoneMobileIcon className='w-4 h-4' />
              </div>
              {t('home.mobile.discover')}
              <ArrowRightIcon className='w-4 h-4' />
            </div>
          </div>
          <div className=''>
            <div className='flex flex-col'>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl'>
                {t('home.title.automate')}
              </h1>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl'>
                {t('home.title.scale')}
              </h1>
              <h1 className='text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl'>
                {t('home.title.iterate')}
              </h1>
            </div>
            <p className='mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8 max-w-lg'>
              {t('home.description')}
            </p>
          </div>
        </section>
      </div>
      <AnimatedBeamHome />
    </div>
  );
}
