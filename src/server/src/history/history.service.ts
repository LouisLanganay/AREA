import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getUserWorkflowHistory(userId: string) {
    const workflows = await this.prismaService.workflow.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    return await Promise.all(
      workflows.map(async (workflow) => {
        const history = await this.prismaService.historyWorkflow.findMany({
          where: { workflowId: workflow.id },
          select: {
            executionDate: true,
            status: true,
          },
        });
        return {
          workflowId: workflow.id,
          name: workflow.name,
          history,
        };
      }),
    );
  }

  async getAllWorkflowHistory() {
    return this.prismaService.historyWorkflow.findMany({
      select: {
        executionDate: true,
        status: true,
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
