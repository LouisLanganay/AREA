import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getServiceAuth, getServices } from '@/api/Services';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/auth/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { oauthCallback } from '@/api/Auth';
import { Service } from '@/interfaces/Services';

export default function Services() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { token: userToken } = useAuth();

  useEffect(() => {
    if (!token && localStorage.getItem('oauth_service_id'))
      localStorage.removeItem('oauth_service_id');
  }, [token]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await getServices();
        setServices(services);
      } catch (error) {
        console.error(error);
      }
    };
    fetchServices();
  }, []);

  async function handleOAuth(service: Service) {
    if (!service.auth || !userToken)
      return;
    try {
      const auth = await getServiceAuth(service.auth.uri, userToken);
      localStorage.setItem('oauth_service_id', service.id);
      window.location.href = auth.redirectUrl;
    } catch (error) {
      console.error(error);
    }
  }

  function authInProgress(serviceId?: string) {
    if (serviceId) {
      if (localStorage.getItem('oauth_service_id') === serviceId)
        return true;
    } else if (localStorage.getItem('oauth_service_id'))
      return true;
    return false;
  }

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const serviceId = localStorage.getItem('oauth_service_id');

      if (!token || !serviceId)
        return;

      const service = services.find(s => s.id === serviceId);

      if (!service?.auth?.callback_uri || !userToken)
        return;

      try {
        await oauthCallback(service.auth.callback_uri, token, userToken);
        // TODO: Handle response
        localStorage.removeItem('oauth_service_id');
        const updatedServices = await getServices();
        setServices(updatedServices);
      } catch (error) {
        console.error('OAuth callback error:', error);
      }
    };

    handleOAuthCallback();
  }, [token, services]);

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
                <img
                  src={service.image}
                  alt={service.name}
                  className='w-12 h-12 rounded-lg aspect-square object-cover'
                />
                <div>
                  <h2 className='text-lg font-semibold'>{service.name}</h2>
                  <p className='text-sm text-muted-foreground'>
                    {service.description}
                  </p>
                </div>
              </div>
              {service.enabled ? (
                <Button
                  variant='secondary'
                  className='w-full'
                  disabled={authInProgress()}
                >
                  Create a workflow
                </Button>
              ) : (
                <Button
                  variant='default'
                  className='w-full'
                  onClick={() => handleOAuth(service)}
                  disabled={!service.auth || authInProgress()}
                >
                  {authInProgress(service.id) ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <PlusIcon className='w-4 h-4' />
                  )}
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
