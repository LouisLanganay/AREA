import { Controller, Get } from '@nestjs/common';
import { ServiceRegister } from '../service/register.service';
import * as os from 'node:os';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AboutController {
  constructor(private serviceRegister: ServiceRegister) {}

  getServerIP() {
    const interfaces = os.networkInterfaces();

    for (const interfaceName in interfaces) {
      const networkInterface = interfaces[interfaceName];
      for (const networkAddress of networkInterface) {
        if (networkAddress.family === 'IPv4' && !networkAddress.internal) {
          return networkAddress.address;
        }
      }
    }
    return '127.0.0.1'; // Retourne localhost si aucune IP externe n'est trouvée
  }

  @Get('/about.json')
  @ApiOperation({ summary: 'Get about.json with data for service' })
  getAbout(): any {
    const json = {
      client: {
        host: this.getServerIP(), // Remplacez par la valeur dynamique si nécessaire
      },
      server: {
        current_time: Math.floor(Date.now() / 1000), // Temps actuel en timestamp Unix
      },
    };
    const services = this.serviceRegister.getAllServices();
    const jsonServices = [];

    services.map((service) => {
      jsonServices.push({
        name: service.name,
        description: service.description,
        actions: service.Event.filter((event) => event.type === 'action').map(
          (event) => ({
            name: event.name,
            description: event.description,
          }),
        ),
        reactions: service.Event.filter(
          (event) => event.type === 'reaction',
        ).map((event) => ({
          name: event.name,
          description: event.description,
        })),
      });
    });
    json['server']['services'] = jsonServices;
    return json;
  }
}
