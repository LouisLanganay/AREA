import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ServiceRegister } from '../register.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceRegister: ServiceRegister) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllServices(@Req() req) {
    return this.serviceRegister.getAllServicesEnabled(req.user.id);
  }
}
