import { Controller, Get } from '@nestjs/common';
import { ServiceRegister } from '../register.service';
import { Service } from '../../../../shared/Workflow';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceRegister: ServiceRegister) {}

  @Get()
  getAllServices(): Service[] {
    return this.serviceRegister.getAllServices();
  }
}
