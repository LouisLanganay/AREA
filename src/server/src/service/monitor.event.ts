import { Event, FieldGroup, Service } from '../../../shared/Workflow';
import { defaultFieldGroup } from './register.service';
import { PrismaService } from '../prisma/prisma.service';
import { Field } from '../../../shared/Users';

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

    const workflows = await this.prisma.workflow.findMany({
      where: { enabled: true },
    });

    const workflow = workflows.find((wf) => wf.id === workflowId);
    if (!workflow) {
      console.error(`Workflow ID ${workflowId} not found.`);
      return;
    }

    const workflowFields: Field[] = [
      {
        id: 'workflow_id',
        type: 'string',
        description: 'Workflow ID',
        value: workflow.id,
        required: true,
      },
      {
        id: 'workflow_name',
        type: 'string',
        description: 'Workflow Name',
        value: workflow.name || 'Unnamed Workflow',
        required: true,
      },
      {
        id: 'workflow_enabled',
        type: 'boolean',
        description: 'Is Workflow Enabled',
        value: workflow.enabled,
        required: true,
      },
      {
        id: 'user_id',
        type: 'string',
        description: 'user id',
        value: workflow.userId,
        required: true,
      },
    ];

    const nodeFieldGroupWorkflow: FieldGroup = {
      id: 'workflow_information',
      name: 'Workflow Information',
      description: 'Details about the current workflow',
      type: 'workflow_info',
      fields: workflowFields,
    };

    if (typeof event.execute === 'function') {
      // console.log(params, nodeFieldGroupWorkflow);
      const result = await event.check([params, nodeFieldGroupWorkflow]);

      console.log(result);
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

      // console.log(service);
      // console.log(node);
      // console.log(node.id_node);
      const event = service.Event.find((e) => e.id_node === node.id_node);
      if (!event) {
        console.error(`Event not found for ${node.name}`);
        continue;
      }

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

        const workflowFields: Field[] = [
          {
            id: 'workflow_id',
            type: 'string',
            description: 'Workflow ID',
            value: workflow.id,
            required: true,
          },
          {
            id: 'workflow_name',
            type: 'string',
            description: 'Workflow Name',
            value: workflow.name || 'Unnamed Workflow',
            required: true,
          },
          {
            id: 'workflow_enabled',
            type: 'boolean',
            description: 'Is Workflow Enabled',
            value: workflow.enabled,
            required: true,
          },
          {
            id: 'node_count',
            type: 'number',
            description: 'Number of Nodes in Workflow',
            value: workflow.nodes.length,
            required: true,
          },
        ];

        const nodeFieldGroupWorkflow: FieldGroup = {
          id: 'workflow_information',
          name: 'Workflow Information',
          description: 'Details about the current workflow',
          type: 'workflow_info',
          fields: workflowFields,
        };

        event.execute([nodeFieldGroup, nodeFieldGroupWorkflow]);
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
