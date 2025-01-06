import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/createWorkflowDto';
import { updateWorkflowDto } from './dto/updateWorkflow.dto';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkflowById(id: string, userId: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        image: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        triggers: {
          where: { parentNodeId: null },
          select: {
            id: true,
            id_node: true,
            type: true,
            name: true,
            serviceName: true,
            fieldGroups: true,
            conditions: true,
            variables: true,
          },
        },
      },
    });

    if (!workflow || workflow.userId !== userId) {
      throw new ForbiddenException({
        err_code: 'WORKFLOW_INVALID_PERM',
      });
    }

    const triggersWithNodes = await Promise.all(
        workflow.triggers.map(async (trigger) => ({
          ...trigger,
          children: await this.fetchNodesRecursively(trigger.id),
        })),
    );

    const { userId: _, ...rest } = workflow;
    return { ...rest, triggers: triggersWithNodes };
  }

  async getWorkflowsByUser(userId: string) {
    const workflows = await this.prisma.workflow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        triggers: {
          where: { parentNodeId: null },
          select: {
            id: true,
            id_node: true,
            type: true,
            name: true,
            serviceName: true,
            fieldGroups: true,
            conditions: true,
            variables: true,
          },
        },
      },
    });

    return Promise.all(
        workflows.map(async (workflow) => ({
          ...workflow,
          triggers: await Promise.all(
              workflow.triggers.map(async (trigger) => ({
                ...trigger,
                children: await this.fetchNodesRecursively(trigger.id),
              })),
          ),
        })),
    );
  }

  async createWorkflow(data: CreateWorkflowDto, userId: string) {
    const createdWorkflow = await this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        enabled: data.enabled,
        userId,
      },
    });

    console.log(data.triggers);
    await this.createNodeRecursively(data.triggers[0], createdWorkflow.id);

    return createdWorkflow;
  }

  private async createNodeRecursively(node: any, workflowId: string, parentNodeId?: string) {
    const createdNode = await this.prisma.node.create({
      data: {
        id_node: node.id_node,
        type: node.type,
        name: node.name,
        serviceName: node.serviceName,
        workflowId: workflowId,
        parentNodeId: parentNodeId || null,
        fieldGroups: node.fieldGroups,
        conditions: node.conditions || null,
        variables: node.variables || null,
      },
    });

    console.log(node.children.length);
    if (node.children?.length) {
      for (const child of node.children) {
        await this.createNodeRecursively(child, workflowId, createdNode.id);
      }
    }
  }

  async updateWorkflow(data: updateWorkflowDto, userId: string) {
    const workflowId = data.id;
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new ForbiddenException({ err_code: 'WORKFLOW_UNKNOWN' });
    }
    if (workflow.userId !== userId) {
      throw new ForbiddenException({ err_code: 'WORKFLOW_INVALID_PERM' });
    }

    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: data.data,
    });
  }

  async deleteWorkflow(id: string, userId: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id, userId },
      select: { id: true },
    });

    if (!workflow) {
      throw new ForbiddenException({
        err_code: 'WORKFLOW_INVALID_PERM',
      });
    }

    await this.prisma.node.deleteMany({ where: { workflowId: id } });
    return this.prisma.workflow.delete({
      where: { id: workflow.id },
      include: { triggers: true },
    });
  }

  private async fetchNodesRecursively(nodeId: string) {
    const nodes = await this.prisma.node.findMany({
      where: { parentNodeId: nodeId },
      select: {
        id: true,
        id_node: true,
        type: true,
        name: true,
        serviceName: true,
        fieldGroups: true,
        conditions: true,
        variables: true,
      },
    });

    return Promise.all(
        nodes.map(async (node) => ({
          ...node,
          nodes: await this.fetchNodesRecursively(node.id),
        })),
    );
  }

  private mapNodesForCreate(nodes: any[], workflowId: string, parentNodeId?: string): any[] {
    return nodes.map((node) => ({
      id_node: node.id_node,
      type: node.type,
      name: node.name,
      serviceName: node.serviceName,
      workflowId,
      parentNodeId,
      fieldGroups: node.fieldGroups,
      conditions: node.conditions || null,
      variables: node.variables || null,
      children: node.children?.length
          ? {
            create: this.mapNodesForCreate(node.children, workflowId, node.id_node),
          }
          : undefined,
    }));
  }


}
