import { oauthCallback } from '@/api/Auth';
import { getServices } from '@/api/Services';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Service } from '@/interfaces/Services';
import { PlusIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { useOAuth } from '@/hooks/useOAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

export default function Services() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('code');
  const { token: userToken } = useAuth();
  const navigate = useNavigate();
  const { openServiceOAuthUrl } = useOAuth();
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token && Cookies.get('service_oauth_provider'))
      Cookies.remove('service_oauth_provider');
  }, [token]);

  useEffect(() => {
    const fetchServices = async () => {
      if (!userToken) return;
      try {
        const services = await getServices(userToken);
        setServices(services);
      } catch (error) {
        console.error(error);
      }
    };
    fetchServices();
  }, []);

  async function handleConnectService(serviceId: string) {
    const service = services.find(s => s.id === serviceId);
    if (!service?.auth?.uri) return;
    try {
      const url = await axiosInstance.get(`${import.meta.env.VITE_API_URL}${service?.auth?.uri}`).then(res => res.data.redirectUrl);
      const redirectUri = `${window.location.origin}/services`;
      const finalUrl = url.replace('%5BREDIRECT_URI%5D', encodeURIComponent(redirectUri));
      openServiceOAuthUrl(finalUrl, service.id);
    } catch (error) {
      console.error(error);
    }
  }

  function authInProgress(serviceId?: string) {
    if (serviceId) {
      if (Cookies.get('service_oauth_provider') === serviceId)
        return true;
    } else if (Cookies.get('service_oauth_provider'))
      return true;
    return false;
  }

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const serviceId = Cookies.get('service_oauth_provider');

      if (!token || !serviceId)
        return;

      const service = services.find(s => s.id === serviceId);

      if (!service?.auth?.callback_uri || !userToken)
        return;

      toast({
        description: t('services.connecting'),
        variant: 'loading',
        duration: Infinity,
      });

      try {
        const response = await oauthCallback(service.auth.callback_uri, token, userToken);
        if (response.status !== 201)
          throw new Error('Failed to connect service');
        Cookies.remove('service_oauth_provider');
        setTimeout(async () => {
          const updatedServices = await getServices(userToken);
          setServices(updatedServices);
          toast({
            description: t('services.connected'),
            variant: 'success',
          });
        }, 2000);
      } catch (error: any) {
        Cookies.remove('service_oauth_provider');
        console.error('OAuth callback error:', error);
        if (error?.response?.status === 500) {
          toast({
            description: t('error.INTERNAL_SERVER_ERROR_DESCRIPTION'),
            variant: 'destructive',
          });
        }
        navigate('/services');
      }
    };

    handleOAuthCallback();
  }, [token, services]);

  function handleCreateWorkflow() {
    navigate(`/workflows/`);
  }

  const toggleServiceExpansion = (serviceId: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const renderServiceCard = (service: Service, isEnabled: boolean) => (
    <motion.div
      key={service.id}
      className='bg-card p-3 rounded-lg border border-border'
    >
      <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <div className='flex bg-muted p-1 rounded-lg border'>
            {service.image ? (
              <img src={service.image} alt={service.name} className='size-6 rounded' />
            ) : (
              <div className='size-6 rounded-lg aspect-square bg-muted flex items-center justify-center'>
                <p className='text-xs md:text-sm text-muted-foreground'>{service.name.charAt(0)}</p>
              </div>
            )}
          </div>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <h2 className='text-md font-semibold'>{service.name}</h2>
              <motion.button
                onClick={() => toggleServiceExpansion(service.id)}
                className='hover:bg-muted p-1 rounded-md'
              >
                <motion.div
                  animate={{ rotate: expandedServices.has(service.id) ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlusIcon className='size-4' />
                </motion.div>
              </motion.button>
            </div>
            <p className='text-sm text-muted-foreground'>{service.description}</p>
          </div>
        </div>
        {isEnabled ? (
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleCreateWorkflow()}
          >
            {t('services.useNow')} <ArrowRightIcon className='size-4' />
          </Button>
        ) : (
          <Button
            size='sm'
            onClick={() => handleConnectService(service.id)}
            disabled={authInProgress(service.id)}
          >
            {t('services.connect')} {service.name} {
              authInProgress(service.id) ?
                <Loader2 className='size-4 animate-spin' /> :
                <PlusIcon className='size-4' />
            }
          </Button>
        )}
      </div>
      <AnimatePresence>
        {expandedServices.has(service.id) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className='overflow-hidden mt-2 flex flex-col gap-2'
          >
            <hr className='my-2 border-border' />
            {service.Event?.some(event => event.type === 'action') && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                  <ArrowDownRightIcon className='size-4 flex-shrink-0' />
                  {t('services.triggers')}
                </h3>
                <div className='grid gap-2'>
                  {service.Event?.filter(event => event.type === 'action').map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className='text-sm p-2 rounded-md bg-muted/50'
                    >
                      <p className='font-medium'>{event.name}</p>
                      <p className='text-muted-foreground text-xs'>{event.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {service.Event?.some(event => event.type === 'reaction') && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                  <ArrowUpRightIcon className='size-4 flex-shrink-0' />
                  {t('services.actions')}
                </h3>
                <div className='grid gap-2'>
                  {service.Event?.filter(event => event.type === 'reaction').map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className='text-sm p-2 rounded-md bg-muted/50'
                    >
                      <p className='font-medium'>{event.name}</p>
                      <p className='text-muted-foreground text-xs'>{event.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>{t('sidebar.items.services')}</h1>
        <p className='text-muted-foreground mt-2'>
          {t('services.description')}
        </p>
      </div>

      <Tabs defaultValue={services.some(service => service.enabled) ? 'enabled' : 'disabled'} data-onboarding="services">
        <TabsList className='mb-4'>
          <TabsTrigger value='enabled'>{t('services.enabled')}</TabsTrigger>
          <TabsTrigger value='disabled'>{t('services.disabled')}</TabsTrigger>
        </TabsList>

        <TabsContent value="enabled" className='flex flex-col gap-2 mt-0'>
          {services.filter(service => service.enabled).length === 0 ? (
            <p className='text-muted-foreground'>
              {t('services.noEnabledServices')}
            </p>
          ) : (
            services.filter(service => service.enabled).map(service => renderServiceCard(service, true))
          )}
        </TabsContent>

        <TabsContent value="disabled" className='flex flex-col gap-2 mt-0'>
          {services.filter(service => !service.enabled).length === 0 ? (
            <p className='text-muted-foreground'>
              {t('services.noDisabledServices')}
            </p>
          ) : (
            services.filter(service => !service.enabled).map(service => renderServiceCard(service, false))
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
