import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/createWorkflowDto';
import { UpdateWorkflowDto } from './dto/updateWorkflow.dto';
import { NodeDto } from './dto/node.dto';
import { EventMonitor } from '../service/monitor.event';
import { ServiceRegister } from '../service/register.service';
import { defineAllService } from '../main';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async runWorkflowById(workflowId: string, data?: any) {
    const allService = new ServiceRegister(this.prisma);
    const monitor = new EventMonitor();
    const tmp = await defineAllService(allService);
    await monitor.executeWorkflowDirectly(
      workflowId,
      tmp.getAllServices(),
      data,
    );
  }

  async runWorkflowByIdSecure(workflowId: string, userId: string, data?: any) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { userId: true },
    });

    if (!workflow) {
      throw new NotFoundException({
        err_code: 'WORKFLOW_NOT_FOUND',
      });
    }
    if (workflow.userId !== userId) {
      throw new ForbiddenException({
        err_code: 'WORKFLOW_INVALID_PERM',
      });
    }
    await this.runWorkflowById(workflowId, data);
  }

  async getWorkflowById(id: string, userId: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        triggers: {
          where: { parentNodeId: null },
          include: {
            children: {
              include: {
                children: {
                  include: {
                    children: {
                      include: {
                        children: {
                          include: {
                            children: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!workflow) {
      throw new ForbiddenException({
        err_code: 'WORKFLOW_NOT_FOUND',
      });
    }

    if (workflow.userId !== userId) {
      throw new ForbiddenException({
        err_code: 'WORKFLOW_INVALID_PERM',
      });
    }

    const { userId: _, ...rest } = workflow;
    return rest;
  }

  async getWorkflowsByUser(userId: string) {
    const workflow = await this.prisma.workflow.findMany({
      where: { userId },
      include: {
        triggers: {
          where: { parentNodeId: null },
          include: {
            children: {
              include: {
                children: {
                  include: {
                    children: {
                      include: {
                        children: {
                          include: {
                            children: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!workflow) {
      throw new ForbiddenException({
        err_code: 'WORKFLOW_NOT_FOUND',
      });
    }

    return workflow;
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
    await this.createNodeRecursively(data.triggers[0], createdWorkflow.id);

    return createdWorkflow;
  }

  private async createNodeRecursively(
    node: any,
    workflowId: string,
    parentNodeId?: string,
  ) {
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

    if (node.children?.length) {
      for (const child of node.children) {
        await this.createNodeRecursively(child, workflowId, createdNode.id);
      }
    }
  }

  async updateWorkflow(data: UpdateWorkflowDto, userId: string, id: string) {
    const workflowId = id;

    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { triggers: true },
    });

    if (!workflow) {
      throw new ForbiddenException({ err_code: 'WORKFLOW_UNKNOWN' });
    }

    if (workflow.userId !== userId) {
      throw new ForbiddenException({ err_code: 'WORKFLOW_INVALID_PERM' });
    }

    const updateData = {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.image && { image: data.image }),
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...(data.favorite !== undefined && { favorite: data.favorite }),
      updatedAt: new Date(),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedWorkflow = await this.prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
    });

    if (data.triggers) {
      await this.updateTriggersRecursively(data.triggers, workflowId);
    }

    return this.getWorkflowById(workflowId, userId);
  }

  private async updateTriggersRecursively(
    triggers: NodeDto[],
    workflowId: string,
    parentNodeId?: string,
  ) {
    if (!parentNodeId) {
      await this.prisma.node.deleteMany({
        where: { workflowId },
      });
    }

    for (const trigger of triggers) {
      const createdNode = await this.prisma.node.create({
        data: {
          id_node: trigger.id_node,
          type: trigger.type,
          name: trigger.name,
          serviceName: trigger.serviceName,
          workflowId: workflowId,
          parentNodeId: parentNodeId || null,
          fieldGroups: trigger.fieldGroups,
          conditions: trigger.conditions || null,
          variables: trigger.variables || null,
        },
      });

      if (trigger.children?.length) {
        await this.updateTriggersRecursively(
          trigger.children,
          workflowId,
          createdNode.id,
        );
      }
    }
  }

  async deleteWorkflow(id: string, userId: string) {
    console.log(id, userId);
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

  private mapNodesForCreate(
    nodes: any[],
    workflowId: string,
    parentNodeId?: string,
  ): any[] {
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
            create: this.mapNodesForCreate(
              node.children,
              workflowId,
              node.id_node,
            ),
          }
        : undefined,
    }));
  }

  public async getWorkflowHistory(userId: string, workflowId) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { userId: true, name: true },
    });
    if (!workflow) {
      throw new NotFoundException({
        err_code: 'WORKFLOW_NOT_FOUND',
      });
    }

    if (workflow.userId !== userId) {
      throw new ForbiddenException({
        err_code: 'WORKFLOW_INVALID_PERM',
      });
    }
    const data = await this.prisma.historyWorkflow.findMany({
      where: { workflowId },
      select: {
        executionDate: true,
        status: true,
      },
    });
    return {
      workflowId,
      name: workflow.name,
      history: data,
    };
  }

  public async getAllWorkflows() {
    return this.prisma.workflow.findMany({
      select: {
        id: true,
        name: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
