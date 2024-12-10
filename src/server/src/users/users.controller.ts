import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDetailSuccess } from './dto/request.doc';
import { updateUserDto } from './dto/update-user.dto';

@ApiTags('users') // Regroupe les routes dans Swagger sous "users"
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiBearerAuth()
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
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: "Update the current user's information" })
  @Post('update')
  @ApiBody({
    type: updateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'updatedemail@example.com',
        username: 'updatedUsername',
        displayName: 'Updated Name',
        avatarUrl: 'https://example.com/new-avatar.png',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'database is unavailable or stop',
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Req() req, @Body() body: updateUserDto) {
    return await this.userService.updateUser(body, req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user connected' })
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted.',
  })
  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async deleteUser(@Req() req: any) {
    await this.userService.deleteUser(req.user.id);
  }
}
