import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [WorkflowService, PrismaService, UsersService],
  controllers: [WorkflowController],
})
export class WorkflowModule {}
