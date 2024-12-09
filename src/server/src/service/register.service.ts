import {Service, Event, FieldGroup, Node} from '../../../shared/Workflow';
import { Injectable } from '@nestjs/common';

export const defaultFieldGroup: FieldGroup = {
    id: "default",
    name: "Default",
    description: "Default Field Group",
    type: "default",
    fields: []
}

@Injectable()
export class ServiceRegister {
    private services: Map<string, Service> = new Map();

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

    getAllServices(): Service[] {
        return Array.from(this.services.values());
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

        if (service.Event.some(e => e.id === event.id)) {
            throw new Error(`Event with ID "${event.id}" already exists in service "${serviceId}".`);
        }

        const clonedEvent: Event = {
            ...event,
            parameters: event.parameters.map(group => ({
                ...group,
                fields: [...group.fields],
            })),
            execute: event.execute || (() => {
                console.log(`Execution not supposed to be call for "${event.name}" of type "${event.type}"`);
            }),
            check: event.check || (async () => {
                console.log(`Checker not supposed to be call for "${event.name}" of type ${event.type}"`);
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
        service.Event = service.Event.filter(event => event.id !== eventId);
        if (initialLength === service.Event.length) {
            throw new Error(`Event with ID "${eventId}" not found in service "${serviceId}".`);
        }
        this.services.set(serviceId, service);
    }

    getEventByIdInService(serviceId: string, eventId: string): Event | undefined {
        const service = this.getServiceById(serviceId);
        if (!service) {
            throw new Error(`Service with ID "${serviceId}" not found.`);
        }
        return service.Event.find(event => event.id === eventId);
    }

    getAllEventByTypeInService(serviceId: string, type: 'Action' | 'Reaction'): Event[] | undefined {
        const service = this.getServiceById(serviceId);
        if (!service) {
            throw new Error(`Service with ID "${serviceId}" not found.`);
        }
        return service.Event.filter(event => event.type === type);
    }

    transformEventToNode(serviceId: string, eventId: string): Node {
        const service = this.getServiceById(serviceId);
        if (!service) {
            throw new Error(`Service with ID "${serviceId}" not found.`);
        }

        const event = service.Event?.find(e => e.id === eventId);
        if (!event) {
            throw new Error(`Event with ID "${eventId}" not found in service "${serviceId}".`);
        }

        const node: Node = {
            id: `node-${event.id}`,
            type: event.type === 'Action' ? 'action' : 'reaction',
            name: event.name,
            description: event.description,
            service: {
                id: service.id,
                name: service.name,
                description: service.description,
            },
            fieldGroups: event.parameters,
            nodes: [],
            variables: [],
            last_trigger: undefined,
        };

        return node;
    }

    addChildNode(parentNode: Node, childNode: Node): void {
        if (!parentNode || !childNode) {
            throw new Error("Parent Node and Child Node must be provided.");
        }

        if (parentNode.nodes.some(node => node.id === childNode.id)) {
            throw new Error(`Child Node with ID "${childNode.id}" already exists in Parent Node "${parentNode.id}".`);
        }

        parentNode.nodes.push(childNode);
    }
}

export class EventMonitor {
    async checkAction(event: Event, params: FieldGroup): Promise<void> {

        if (!event) {
            throw new Error(`Event with ID "${event.id}" not found.`);
        }

        if (typeof event.execute === "function") {
            const result = event.check([params]);

            if (result) {
                console.log(`Condition met for event "${event.name}".`);
            } else {
                console.log(`Condition not met for event "${event.name}".`);
            }
        }
    }

    startMonitoring(event: Event, params: FieldGroup, interval: number): void {
        setInterval(() => {
            this.checkAction(event, params).catch(console.error);
        }, interval);
    }
}
