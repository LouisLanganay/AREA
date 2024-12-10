import { Controller, Get } from '@nestjs/common';
import { ServiceRegister } from '../register.service';
import { Service } from '../../../../shared/Workflow';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceRegister: ServiceRegister) {}

  @Get()
  getAllServices(): Service[] {
    return this.serviceRegister.getAllServices();
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllServices(@Req() req) {
    return this.serviceRegister.getAllServices(req.user.id);
  }
}
