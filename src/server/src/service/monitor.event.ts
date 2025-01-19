import { Event, FieldGroup, Service } from '../../../shared/Workflow';
import { defaultFieldGroup } from './register.service';
import { PrismaService } from '../prisma/prisma.service';
import { Field } from '../../../shared/Users';

export class EventMonitor {
  private prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  async executeWorkflowDirectly(
    workflowId: string,
    serviceList: Service[],
    data_supply?: any,
  ): Promise<void> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { triggers: true },
    });

    if (!workflow) {
      throw new Error(`Workflow ID ${workflowId} not found or not enabled.`);
    }

    const rootNode = workflow.triggers.find((node) => !node.parentNodeId);

    if (!rootNode) {
      throw new Error(`No root node found for workflow ID ${workflowId}.`);
    }

    let status_workflow = 'success';
    try {
      await this.executeDependentNodes(
        rootNode.id,
        workflowId,
        serviceList,
        data_supply,
      );
    } catch (error) {
      console.error(`Error executing workflow ${workflowId}:`, error);
      status_workflow = 'failure';
    } finally {
      await this.prisma.historyWorkflow.create({
        data: {
          workflowId,
          status: status_workflow,
          executionDate: new Date(),
        },
      });
    }
  }

  async checkAction(
    event: Event,
    params: FieldGroup,
    serviceList: Service[],
    workflowId: string,
  ): Promise<void> {
    if (!event) {
      throw new Error(`Event with ID "${event?.id_node}" not found.`);
    }
    const workflows = await this.prisma.workflow.findMany({
      where: { enabled: true },
      include: { triggers: true },
    });
    const workflow = workflows.find((wf) => wf.id === workflowId);
    if (!workflow) {
      console.error(`Workflow ID ${workflowId} not found or not enabled.`);
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

    let status_workflow = 'failure';
    try {
      if (typeof event.check === 'function') {
        const result = await event.check([params, nodeFieldGroupWorkflow]);
        if (result) {
          status_workflow = 'success';
          const root_node = workflow.triggers.find(
            (node) => node.id_node === event.id_node,
          );
          if (root_node) {
            await this.executeDependentNodes(
              root_node.id,
              workflowId,
              serviceList,
            );
          }
        } else {
          status_workflow = 'failure';
        }
      }
    } catch (error) {
      console.error(error);
      status_workflow = 'failure';
    } finally {
      await this.prisma.historyWorkflow.create({
        data: {
          workflowId,
          status: status_workflow,
          executionDate: new Date(),
        },
      });
    }
  }

  async executeDependentNodes(
    nodeId: string,
    workflowId: string,
    serviceList: Service[],
    data_supply?: any,
  ): Promise<void> {
    const workflows = await this.prisma.workflow.findMany({
      where: { enabled: true },
      include: { triggers: true },
    });
    const workflow = workflows.find((wf) => wf.id === workflowId);
    if (!workflow) {
      console.error(`Workflow ID ${workflowId} not found or not enabled.`);
      return;
    }

    const dependentNodes = workflow.triggers.filter(
      (node) => node.parentNodeId === nodeId,
    );
    for (const node of dependentNodes) {
      const service = serviceList.find((s) => s.id === node.serviceName);

      if (!service) {
        console.error(`Service not found for node: ${node.name}`);
        continue;
      }

      const event = service.Event.find((e) => e.id_node === node.id_node);
      if (!event) {
        console.error(`Event not found for ${node.name}`);
        continue;
      }

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
          id: 'user_id',
          type: 'string',
          description: 'user id',
          value: workflow.userId,
          required: true,
        },
      ];

      const data_supply_fields: Field[] = [
        {
          id: 'data',
          type: 'string',
          description: 'Workflow ID',
          value: data_supply,
          required: true,
        },
      ];

      const dataFieldGroup: FieldGroup = {
        id: 'data_supply',
        name: 'Data Supply',
        description: 'Data Supply',
        type: 'data_supply',
        fields: data_supply_fields,
      };

      const nodeFieldGroupWorkflow: FieldGroup = {
        id: 'workflow_information',
        name: 'Workflow Information',
        description: 'Details about the current workflow',
        type: 'workflow_info',
        fields: workflowFields,
      };

      if (typeof event.execute === 'function') {
        const value = await event.execute([
          nodeFieldGroup,
          nodeFieldGroupWorkflow,
          dataFieldGroup,
        ]);
        if (typeof value === 'boolean' && !value) {
          return;
        }
      }

      await this.executeDependentNodes(node.id, workflowId, serviceList);
    }
  }

  public async fetchAndCheckWorkflows(serviceList: Service[]): Promise<void> {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { enabled: true },
        include: { triggers: true },
      });

      for (const workflow of workflows) {
        const actionNodes = workflow.triggers.filter(
          (node) => node.type === 'action',
        );

        for (const actionNode of actionNodes) {
          const service = serviceList.find(
            (s) => s.id === actionNode.serviceName,
          );
          if (!service) {
            console.error(
              `Service "${actionNode.serviceName}" not found for node ${actionNode.name}`,
            );
            continue;
          }

          const event = service.Event.find(
            (e) => e.id_node === actionNode.id_node,
          );
          if (!event) {
            console.error(
              `Event not found for node ${actionNode.name} in service ${service.id}`,
            );
            continue;
          }

          let nodeFieldGroup: FieldGroup;
          if (
            actionNode.fieldGroups &&
            Array.isArray(actionNode.fieldGroups) &&
            actionNode.fieldGroups.length > 0
          ) {
            const fieldGroups: any = actionNode.fieldGroups[0];
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

          await this.checkAction(
            event,
            nodeFieldGroup,
            serviceList,
            workflow.id,
          );
        }
      }
    } catch (error) {
      console.error('Error while fetching and checking workflows:', error);
    }
  }

  public startAutoFetchAndCheck(serviceList: Service[]) {
    console.log('start fetch');
    setInterval(() => {
      this.fetchAndCheckWorkflows(serviceList).catch(console.error);
    }, 5000); // 10 000 ms = 10 secondes
  }
}
