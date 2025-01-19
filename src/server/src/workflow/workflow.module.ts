import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
  providers: [WorkflowService, PrismaService, UsersService],
  imports: [UsersModule],
  controllers: [WorkflowController],
})
export class WorkflowModule {}
