import { useTranslation } from 'react-i18next';
import { Service } from '../../../shared/Workflow';
import { useEffect, useState } from 'react';
import { getServices } from '@/api/Services';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function Services() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await getServices();
        setServices(services);
      } catch (error) {
        // TODO: Handle error
        console.error(error);
      }
    };
    fetchServices();
  }, []);

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
                >
                  Create a workflow
                </Button>
              ) : (
                <Button
                  variant='default'
                  className='w-full'
                >
                  Connect <PlusIcon className='w-4 h-4 ml-2' />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
