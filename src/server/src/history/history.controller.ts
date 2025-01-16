import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Controller('workflows-history')
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the history of all workflows for a user' })
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
  async getUserWorkflowHistory(@Req() req: any) {
    console.log('Fetching workflow history for user:', req.user.id);
    const userId = req.user.id;
    return this.historyService.getUserWorkflowHistory(userId);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the history of all workflows' })
  @ApiResponse({
    status: 200,
    description:
      'The history of all workflows has been successfully retrieved.',
    schema: {
      example: [
        {
          executionDate: '2025-01-15T10:41:35.665Z',
          status: 'sucess',
          workflow: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Workflow 1',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async getWorkflowHistoryAdmin(@Req() req: any) {
    const userId = req.user.id;
    const isAdmin = await this.userService.checkRole(userId, 'admin');
    console.log('Fetching all workflow history for admin:', userId, isAdmin);
    if (!userId || !isAdmin)
      throw new UnauthorizedException({ err_code: 'GET_HISTORY_ADMIN' });
    return this.historyService.getAllWorkflowHistory();
  }
}
