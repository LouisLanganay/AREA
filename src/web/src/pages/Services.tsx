import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getServices } from '@/api/Services';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/auth/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { oauthCallback } from '@/api/Auth';
import { Service } from '@/interfaces/Services';
import { toast } from '@/hooks/use-toast';
import { getServiceProvider } from '@/utils/servicesProviders';
import { useOAuth } from '@/hooks/useOAuth';
import Cookies from 'js-cookie';

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

      console.log("handleOAuthCallback", token, serviceId);

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
            title: t('error.INTERNAL_SERVER_ERROR'),
            description: t('error.INTERNAL_SERVER_ERROR_DESCRIPTION'),
            variant: 'destructive',
          });
        }
        navigate('/services');
      }
    };

    console.log("handleOAuthCallback");

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

      {services.length === 0 && (
        <p className='text-muted-foreground'>
          No services found. Contact support to add services.
        </p>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {services.map((service) => (
          <Card
            key={service.id}
          >
            <CardContent className='p-6'>
              <div className='flex items-center gap-4 mb-4'>
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className='size-12 rounded-lg aspect-square object-cover'
                  />
                ) : (
                  <div className='size-12 rounded-lg aspect-square bg-muted flex items-center justify-center'>
                    <p className='text-muted-foreground'>{service.name.charAt(0)}</p>
                  </div>
                )}
                <div>
                  <h2 className='text-lg font-semibold'>{service.name}</h2>
                  <p className='text-sm text-muted-foreground'>
                    {service.description}
                  </p>
                </div>
              </div>
              {service.enabled || !getServiceProvider(service.id) ? (
                <Button
                  variant='secondary'
                  className='w-full'
                  disabled={authInProgress()}
                  size='sm'
                  onClick={() => handleCreateWorkflow()}
                >
                  Create a workflow
                </Button>
              ) : (
                <Button
                  variant='default'
                  className='w-full'
                  onClick={() => openServiceOAuthUrl(
                    getServiceProvider(service.id)?.redirect || '',
                    service.id
                  )}
                  disabled={authInProgress()}
                  size='sm'
                >
                  Connect App
                  {authInProgress(service.id) ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <PlusIcon className='w-4 h-4' />
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
