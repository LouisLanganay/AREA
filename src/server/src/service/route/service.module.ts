import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceRegister } from '../register.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [ServiceController],
  providers: [ServiceRegister, PrismaService],
  exports: [ServiceRegister],
})
export class ServiceModule {}
