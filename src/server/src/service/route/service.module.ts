import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceRegister } from '../register.service';

@Module({
  imports: [],
  controllers: [ServiceController],
  providers: [ServiceRegister],
  exports: [ServiceRegister],
})
export class ServiceModule {}
