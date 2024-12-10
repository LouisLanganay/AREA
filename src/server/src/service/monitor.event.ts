import { Event, FieldGroup, Service } from '../../../shared/Workflow';
import { defaultFieldGroup } from './register.service';
import { PrismaService } from '../prisma/prisma.service';

export class EventMonitor {
  private prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  async checkAction(event: Event, params: FieldGroup): Promise<void> {
    if (!event) {
      throw new Error(`Event with ID "${event.id}" not found.`);
    }

    if (typeof event.execute === 'function') {
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

  async monitoringAllActions(serviceList: Service[]): Promise<void> {
    try {
      const actions = await this.prisma.node.findMany({
        where: { type: 'action' },
      });

      actions.forEach((action) => {
        const service = serviceList.find((s) => s.id === action.serviceName);

        if (service) {

          const event = service.Event.find((e) => e.id === action.id_node);

          if (event) {
            let nodeFieldGroup: FieldGroup;

            if (
              action.fieldGroups &&
              Array.isArray(action.fieldGroups) &&
              action.fieldGroups.length > 0
            ) {
              const fieldGroups: any = action.fieldGroups[0];
              const fields = Array.isArray(fieldGroups.fields)
                ? fieldGroups.fields.map((field: any) => {
                    return {
                      id: field.id || 'default_id',
                      type: field.type || 'string',
                      description: field.description || 'No description',
                      value: field.value,
                      required: field.required || false,
                      options: Array.isArray(field.options)
                        ? field.options
                        : [],
                    };
                  })
                : [];

              nodeFieldGroup = {
                id: fieldGroups.id || 'default_id',
                name: fieldGroups.name || 'Unnamed',
                description: fieldGroups.description || 'No description',
                type: fieldGroups.type || 'default',
                fields: fields,
              };
            } else {
              nodeFieldGroup = defaultFieldGroup;
            }

            this.startMonitoring(event, nodeFieldGroup, 30000);
          } else {
            console.log(
              `No matching event found for action ID: ${action.id_node} in service ${service.name}`,
            );
          }
        } else {
          console.log(
            `No service found for action with serviceName: ${action.serviceName}`,
          );
        }
      });
    } catch (error) {
      console.error('Error while starting monitoring for all actions:', error);
    }
  }
}
