import { Event, FieldGroup, Node, Service } from '../../../shared/Workflow';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const defaultFieldGroup: FieldGroup = {
  id: 'default',
  name: 'Default',
  description: 'Default Field Group',
  type: 'default',
  fields: [],
};

@Injectable()
export class ServiceRegister {
  private services: Map<string, Service> = new Map();
  constructor(private readonly prismaService: PrismaService) {}

  addService(service: Service): void {
    if (this.services.has(service.id)) {
      throw new Error(`Service with ID "${service.id}" already exists.`);
    }
    const clonedService = JSON.parse(JSON.stringify(service));
    this.services.set(service.id, clonedService);
  }

  removeServiceById(serviceId: string): void {
    if (!this.services.delete(serviceId)) {
      throw new Error(`Service with ID "${serviceId}" not found.`);
    }
  }

  getServiceById(serviceId: string): Service | undefined {
    return this.services.get(serviceId);
  }

  getAllServicesId(): string[] {
    return Array.from(this.services.keys());
  }

  getAllServices() {
    return Array.from(this.services.values());
  }

  async getAllServicesEnabled(userId: string) {
    const serviceArray = Array.from(this.services.values());

    return await Promise.all(
      serviceArray.map(async (service) => {
        const token = await this.prismaService.token.findFirst({
          where: {
            provider: service.id,
            userId: userId,
          },
        });
        return {
          ...service,
          enabled: !!token,
        };
      }),
    );
  }

  updateService(serviceId: string, updates: Partial<Service>): void {
    const service = this.getServiceById(serviceId);
    if (!service) {
      throw new Error(`Service with ID "${serviceId}" not found.`);
    }
    const updatedService = { ...service, ...updates };
    this.services.set(serviceId, updatedService);
  }

  addEventToService(serviceId: string, event: Event): void {
    const service = this.getServiceById(serviceId);
    if (!service) {
      throw new Error(`Service with ID "${serviceId}" not found.`);
    }

    if (!service.Event) {
      service.Event = [];
    }

    if (service.Event.some((e) => e.id_node === event.id_node)) {
      throw new Error(
        `Event with ID "${event.id_node}" already exists in service "${serviceId}".`,
      );
    }

    const clonedEvent: Event = {
      ...event,
      fieldGroups: event.fieldGroups.map((group) => ({
        ...group,
        fields: [...group.fields],
      })),
      execute:
        event.execute ||
        (() => {
          console.log(
            `Execution not supposed to be call for "${event.name}" of type "${event.type}"`,
          );
        }),
      check:
        event.check ||
        (async () => {
          console.log(
            `Checker not supposed to be call for "${event.name}" of type ${event.type}"`,
          );
          return true;
        }),
    };

    service.Event.push(clonedEvent);

    this.services.set(serviceId, service);
  }

  removeEventFromService(serviceId: string, eventId: string): void {
    const service = this.getServiceById(serviceId);
    if (!service) {
      throw new Error(`Service with ID "${serviceId}" not found.`);
    }
    const initialLength = service.Event.length;
    service.Event = service.Event.filter((event) => event.id_node !== eventId);
    if (initialLength === service.Event.length) {
      throw new Error(
        `Event with ID "${eventId}" not found in service "${serviceId}".`,
      );
    }
    this.services.set(serviceId, service);
  }

  getEventByIdInService(serviceId: string, eventId: string): Event | undefined {
    const service = this.getServiceById(serviceId);
    if (!service) {
      throw new Error(`Service with ID "${serviceId}" not found.`);
    }
    return service.Event.find((event) => event.id_node === eventId);
  }

  getAllEventByTypeInService(
    serviceId: string,
    type: 'action' | 'reaction',
  ): Event[] | undefined {
    const service = this.getServiceById(serviceId);
    if (!service) {
      throw new Error(`Service with ID "${serviceId}" not found.`);
    }
    return service.Event.filter((event) => event.type === type);
  }

  transformEventToNode(serviceId: string, eventId: string): Node {
    const service = this.getServiceById(serviceId);
    if (!service) {
      throw new Error(`Service with ID "${serviceId}" not found.`);
    }

    const event = service.Event?.find((e) => e.id_node === eventId);
    if (!event) {
      throw new Error(
        `Event with ID "${eventId}" not found in service "${serviceId}".`,
      );
    }

    return {
      id: `node-${event.id_node}`,
      type: event.type,
      name: event.name,
      description: event.description,
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
      },
      fieldGroups: event.fieldGroups,
      nodes: [],
      variables: [],
      last_trigger: undefined,
    };
  }

  addChildNode(parentNode: Node, childNode: Node): void {
    if (!parentNode || !childNode) {
      throw new Error('Parent Node and Child Node must be provided.');
    }

    if (parentNode.nodes.some((node) => node.id === childNode.id)) {
      throw new Error(
        `Child Node with ID "${childNode.id}" already exists in Parent Node "${parentNode.id}".`,
      );
    }

    parentNode.nodes.push(childNode);
  }
}
