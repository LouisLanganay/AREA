import { Event, FieldGroup, Service } from '../../../shared/Workflow';
import { defaultFieldGroup } from './register.service';
import { PrismaService } from '../prisma/prisma.service';

export class EventMonitor {
  private prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  async checkAction(
    event: Event,
    params: FieldGroup,
    serviceList: Service[],
    workflowId: string,
  ): Promise<void> {
    if (!event) {
      throw new Error(`Event with ID "${event.id_node}" not found.`);
    }

    if (typeof event.execute === 'function') {
      const result = await event.check([params]);

      if (result) {
        await this.executeDependentNodes(
          event.id_node,
          workflowId,
          serviceList,
        );
      }
    }
  }

  async executeDependentNodes(
    nodeId: string,
    workflowId: string,
    serviceList: Service[],
  ): Promise<void> {
    const workflows = await this.prisma.workflow.findMany({
      where: { enabled: true },
      include: { nodes: true },
    });

    const workflow = workflows.find((wf) => wf.id === workflowId);
    if (!workflow) {
      console.error(`Workflow ID ${workflowId} not found.`);
      return;
    }

    const dependentNodes = workflow.nodes.filter(
      (node) => node.dependsOn === nodeId,
    );

    for (const node of dependentNodes) {
      const service = serviceList.find((s) => s.id === node.serviceName);
      if (!service) {
        console.error(`Service not found for node: ${node.name}`);
        continue;
      }

      const event = service.Event.find((e) => e.id_node === node.id_node);
      if (event) {
        let nodeFieldGroup: FieldGroup;

        if (
          node.fieldGroups &&
          Array.isArray(node.fieldGroups) &&
          node.fieldGroups.length > 0
        ) {
          const fieldGroups: any = node.fieldGroups[0];
          const fields = Array.isArray(fieldGroups.fields)
            ? fieldGroups.fields.map((field: any) => {
                return {
                  id: field.id || 'default_id',
                  type: field.type || 'string',
                  description: field.description || 'No description',
                  value: field.value,
                  required: field.required || false,
                  options: Array.isArray(field.options) ? field.options : [],
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

        event.execute([nodeFieldGroup]);
      }
    }
  }

  startMonitoring(
    event: Event,
    params: FieldGroup,
    interval: number,
    serviceList: Service[],
    workflowId: string,
  ): void {
    setInterval(() => {
      this.checkAction(event, params, serviceList, workflowId).catch(
        console.error,
      );
    }, interval);
  }

  async transformNodeToEventAndRunMonitoring(
    action,
    serviceList: Service[],
    workflowId: string,
  ) {
    const service = serviceList.find((s) => s.id === action.serviceName);

    if (service) {
      const event = service.Event.find((e) => e.id_node === action.id_node);

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
                  options: Array.isArray(field.options) ? field.options : [],
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

        this.startMonitoring(
          event,
          nodeFieldGroup,
          10000,
          serviceList,
          workflowId,
        );
      } else {
        console.log(
          `No matching event found for action ID: ${action.id_node} in service ${service.name}`,
        );
      }
    }
  }

  async monitoringWorkflows(serviceList: Service[]): Promise<void> {
    const handledWorkflows = new Set<string>();
    const interval = 30000;

    const processWorkflows = async () => {
      try {
        const workflows = await this.prisma.workflow.findMany({
          where: { enabled: true },
          include: { nodes: true },
        });

        const newWorkflows = workflows.filter(
          (workflow) => !handledWorkflows.has(workflow.id),
        );

        if (newWorkflows.length > 0) {
          console.log(`Found ${newWorkflows.length} new workflows to handle.`);

          newWorkflows.forEach((workflow) => {
            const actionNodes = workflow.nodes.filter(
              (node) => node.type === 'action',
            );

            actionNodes.forEach((node) => {
              this.transformNodeToEventAndRunMonitoring(
                node,
                serviceList,
                workflow.id,
              );
            });

            handledWorkflows.add(workflow.id);
          });
        }
      } catch (error) {
        console.error('Error while processing workflows:', error);
      }
    };

    await processWorkflows();

    setInterval(processWorkflows, interval);
  }
}
