import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/creatWorkflowDto';
import { updateWorkflowDto } from './dto/updateWorkflow.dto';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async createWorkflow(data: CreateWorkflowDto, userId: string) {
    await this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        enabled: data.enabled,
        userId,
        nodes: {
          create: data.nodes.map((node) => ({
            id_node: node.id_node,
            type: node.type,
            name: node.name,
            serviceName: node.serviceName,
            dependsOn: node.dependsOn,
            fieldGroups: node.fieldGroups,
            conditions: node.conditions || null,
            variables: node.variables || null,
          })),
        },
      },
      include: { nodes: true },
    });
  }

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
        nodes: {
          select: {
            id: true,
            id_node: true,
            type: true,
            name: true,
            serviceName: true,
            dependsOn: true,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: _, ...rest } = workflow;
    return rest;
  }

  // Récupérer tous les workflows d’un utilisateur
  async getWorkflowsByUser(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        nodes: {
          select: {
            id: true,
            id_node: true,
            type: true,
            name: true,
            serviceName: true,
            dependsOn: true,
            fieldGroups: true,
            conditions: true,
            variables: true,
          },
        },
      },
    });
  }

  // Mettre à jour un workflow, avec validation de propriété
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

  // Supprimer un workflow, avec validation de propriété
  async deleteWorkflow(id: string, userId: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id, userId: userId },
      select: { id: true },
    });

    if (!workflow) {
      throw new ForbiddenException({
        err_code: 'WORKFLOW_INVALID_PERM',
      });
    }

    await this.prisma.node.deleteMany({ where: { workflowId: id } });
    await this.prisma.workflow.delete({
      where: { id: workflow.id },
      include: { nodes: true },
    });
  }
}
