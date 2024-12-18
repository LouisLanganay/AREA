import { oauthCallback } from '@/api/Auth';
import { getServices } from '@/api/Services';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useOAuth } from '@/hooks/useOAuth';
import { Service } from '@/interfaces/Services';
import { PlusIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';
import { ArrowRightIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Services() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('code');
  const { token: userToken } = useAuth();
  const navigate = useNavigate();
  const { openServiceOAuthUrl } = useOAuth();

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

      try {
        await oauthCallback(service.auth.callback_uri, token, userToken);
        // TODO: Handle response
        Cookies.remove('service_oauth_provider');
        const updatedServices = await getServices(userToken);
        setServices(updatedServices);
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

  return (
    <>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>{t('sidebar.items.services')}</h1>
        <p className='text-muted-foreground mt-2'>
          Connect and manage your service integrations
        </p>
      </div>

      <Tabs defaultValue="enabled">
        <TabsList className='mb-4'>
          <TabsTrigger value="disabled">Not connected</TabsTrigger>
          <TabsTrigger value="enabled">Actives</TabsTrigger>
        </TabsList>

        <TabsContent value="enabled" className='flex flex-col gap-2 mt-0'>
          {services.filter(service => service.enabled || !service.auth?.callback_uri).length === 0 ? (
            <p className='text-muted-foreground'>
              No enabled services found.
            </p>
          ) : (
            services.filter(service => service.enabled || !service.auth?.callback_uri).map((service) => (
              <div className='bg-card p-3 rounded-lg border border-border flex flex-col md:flex-row justify-between md:items-center gap-2'>
                <div className='flex flex-row items-center gap-2'>
                  <div className='flex bg-muted p-1 rounded-lg border'>
                    {service.image ? (
                      <img src={service.image} alt={service.name} className='size-6 rounded-lg aspect-square object-cover' />
                    ) : (
                      <div className='size-6 rounded-lg aspect-square bg-muted flex items-center justify-center'>
                        <p className='text-xs md:text-sm text-muted-foreground'>{service.name.charAt(0)}</p>
                      </div>
                    )}
                  </div>
                  <div className='flex flex-col'>
                    <h2 className='text-md font-semibold'>{service.name}</h2>
                    <p className='text-sm text-muted-foreground'>{service.description}</p>
                  </div>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleCreateWorkflow()}
                >
                  Use it now <ArrowRightIcon className='size-4' />
                </Button>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="disabled" className='flex flex-col gap-2 mt-0'>
          {services.filter(service => !service.enabled && service.auth?.callback_uri).length === 0 ? (
            <p className='text-muted-foreground'>
              No disabled services found.
            </p>
          ) : (
            services.filter(service => !service.enabled && service.auth?.callback_uri).map((service) => (
              <div className='bg-card p-3 rounded-lg border border-border flex flex-col md:flex-row justify-between md:items-center gap-2'>
                <div className='flex flex-row items-center gap-2'>
                  <div className='flex bg-muted p-1 rounded-lg border'>
                    {service.image ? (
                      <img src={service.image} alt={service.name} className='size-6 rounded-lg aspect-square object-cover' />
                    ) : (
                      <div className='size-6 rounded-lg aspect-square bg-muted flex items-center justify-center'>
                        <p className='text-xs md:text-sm text-muted-foreground'>{service.name.charAt(0)}</p>
                      </div>
                    )}
                  </div>
                  <div className='flex flex-col'>
                    <h2 className='text-md font-semibold'>{service.name}</h2>
                    <p className='text-sm text-muted-foreground'>{service.description}</p>
                  </div>
                </div>
                <Button
                  size='sm'
                  onClick={() => {
                    if (service.auth)
                      openServiceOAuthUrl(service.auth.callback_uri, service.id);
                  }}
                  disabled={authInProgress(service.id)}
                >
                  Connect {service.name} {
                    authInProgress(service.id) ?
                      <Loader2 className='size-4 animate-spin' /> :
                      <PlusIcon className='size-4' />
                  }
                </Button>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
