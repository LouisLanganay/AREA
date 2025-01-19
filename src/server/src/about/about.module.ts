import { Module } from '@nestjs/common';
import { ServiceRegister } from '../service/register.service';

@Module({
  providers: [ServiceRegister],
})
export class AboutModule {}
