import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceModule } from '../service/route/service.module';

@Module({
  imports: [ServiceModule],
  controllers: [AiController],
  providers: [AiService, PrismaService],
  exports: [AiService]
})
export class AiModule {}
