import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDetailSuccess } from './dto/request.doc';
import { updateUserDto } from './dto/update-user.dto';

@ApiTags('users') // Regroupe les routes dans Swagger sous "users"
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiBearerAuth() // Indique que cette route nécessite un JWT
  @ApiOperation({ summary: "Get the current user's information" }) // Résumé de l'opération
  @ApiResponse({
    status: 200,
    description: 'Successful Response',
    type: UserDetailSuccess,
  })
  @ApiResponse({
    status: 503,
    description: 'database is unavailable or stop',
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: any) {
    return this.userService.getUserInfo(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Update the current user's information" })
  @Post('update')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Req() req: updateUserDto) {
    // Ajouter votre logique ici
  }
}
