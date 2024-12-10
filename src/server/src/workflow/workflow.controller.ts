import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Put,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/creatWorkflowDto';
import { AuthGuard } from '@nestjs/passport';
import { updateWorkflowDto } from './dto/updateWorkflow.dto';

@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createWorkflow(@Body() data: CreateWorkflowDto, @Req() req: any) {
    return this.workflowService.createWorkflow(data, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @HttpCode(200)
  async getWorkflowById(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id; // Récupère l'ID utilisateur depuis le token
    console.log('userId: ', userId);
    return this.workflowService.getWorkflowById(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getWorkflowsByUser(@Param('userId') userId: string, @Req() req: any) {
    const loggedInUserId = req.user.userId; // ID utilisateur connecté
    if (userId !== loggedInUserId) {
      throw new ForbiddenException(
        'You are not authorized to access these workflows',
      );
    }
    return this.workflowService.getWorkflowsByUser(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateWorkflow(
    @Param('id') id: string,
    @Body() data: updateWorkflowDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.workflowService.updateWorkflow(data, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(204)
  async deleteWorkflow(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.workflowService.deleteWorkflow(id, userId);
  }
}
