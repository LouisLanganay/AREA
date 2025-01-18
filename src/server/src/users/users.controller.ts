import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
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
  ApiParam,
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
  @Patch('update/:id')
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
  async updateUser(
    @Req() req,
    @Body() body: updateUserDto,
    @Param('id') id: string,
  ) {
    if (
      req.user.id !== id &&
      !(await this.userService.checkRole(req.user.id, 'admin'))
    ) {
      throw new ForbiddenException({ err_code: 'USER_FORBIDDEN_EDIT' });
    }
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

  @ApiOperation({ summary: 'Check if a username is already in use' })
  @ApiResponse({
    status: 200,
    description: 'The availability of the username was successfully checked.',
    schema: {
      example: { used: true }, // Exemple de réponse
    },
  })
  @ApiParam({
    name: 'username',
    description: 'The username to check for availability',
    required: true,
    type: String,
  })
  @Get('/use/:username')
  async checkUsername(@Param('username') username: string) {
    return { used: await this.userService.checkUserUsernameExist(username) };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID (for admin)' })
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted.',
  })
  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  async deleteUserById(@Param('id') id: string) {
    const isAdmin = await this.userService.checkRole(id, 'admin');
    if (!isAdmin) {
      throw new ForbiddenException({ err_code: 'USER_FORBIDDEN_DELETE' });
    }
    await this.userService.deleteUser(id);
  }

  @Get('isAdmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if the user is an admin' })
  @ApiResponse({
    status: 200,
    description: 'The user is an admin.',
    schema: {
      example: { isAdmin: true },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  async isAdmin(@Req() req: any) {
    return { isAdmin: await this.userService.checkRole(req.user.id, 'admin') };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (for admin)' })
  @ApiResponse({
    status: 200,
    description: 'All users',
  })
  @UseGuards(AuthGuard('jwt'))
  async allUsers(@Req() req: any) {
    const isAdmin = await this.userService.checkRole(req.user.id, 'admin');
    if (!isAdmin) {
      throw new ForbiddenException({ err_code: 'USER_ADMIN' });
    }
    return this.userService.getAllUsers();
  }

  @Get('setRole/:id/:role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set role for user(for admin)' })
  @ApiResponse({
    status: 200,
    description: 'Role has been set',
  })
  @UseGuards(AuthGuard('jwt'))
  async setRole(
    @Param('id') id: string,
    @Param('role') role: string,
    @Req() req: any,
  ) {
    const isAdmin = await this.userService.checkRole(req.user.id, 'admin');
    if (!isAdmin) {
      throw new ForbiddenException({ err_code: 'USER_ADMIN' });
    }
    await this.userService.setRole(id, role);
  }

  @Get('setStatus/:id/:status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set status for user(for admin)' })
  @ApiResponse({
    status: 200,
    description: 'Status has been set',
  })
  @UseGuards(AuthGuard('jwt'))
  async setStatus(
    @Param('id') id: string,
    @Param('status') status: string,
    @Req() req: any,
  ) {
    const isAdmin = await this.userService.checkRole(req.user.id, 'admin');
    if (!isAdmin) {
      throw new ForbiddenException({ err_code: 'USER_ADMIN' });
    }
    await this.userService.setStatus(id, status);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID(for admin)' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserDetailSuccess,
  })
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Param('id') id: string, @Req() req: any) {
    const isAdmin = await this.userService.checkRole(req.user.id, 'admin');
    if (!isAdmin) {
      throw new ForbiddenException({ err_code: 'USER_ADMIN' });
    }
    return this.userService.getUserInfo(id);
  }
  @Get(':id/workflows-history')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the history of all workflows for a user for admin',
  })
  @ApiResponse({
    status: 200,
    description:
      'The history of all workflows has been successfully retrieved.',
    schema: {
      example: [
        {
          workflowId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Workflow 1',
          history: [
            { executionDate: '2025-01-15T10:41:35.665Z', status: 'sucess' },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @UseGuards(AuthGuard('jwt'))
  async getUserWorkflowHistory(@Param('id') id: string, @Req() req: any) {
    const isAdmin = await this.userService.checkRole(req.user.id, 'admin');
    if (!isAdmin) {
      throw new ForbiddenException({ err_code: 'USER_ADMIN' });
    }
    return this.userService.getUserWorkflowsHistory(id);
  }
}
