import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryService } from './history.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [HistoryController],
  providers: [PrismaService, HistoryService, UsersService],
})
export class HistoryModule {}
