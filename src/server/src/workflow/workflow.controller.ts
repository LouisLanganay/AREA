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
  Patch,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/creatWorkflowDto';
import { AuthGuard } from '@nestjs/passport';
import { updateWorkflowDto } from './dto/updateWorkflow.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiBody({ type: CreateWorkflowDto })
  @ApiBody({
    type: CreateWorkflowDto,
    examples: {
      example1: {
        summary: 'Example workflow',
        value: {
          name: 'New Workflow',
          description: 'This is a new workflow',
          image: 'https://example.com/image.png',
          enabled: true,
          nodes: [
            {
              id: 'node1',
              type: 'type1',
              name: 'Node 1',
              serviceName: 'Service 1',
              dependsOn: [],
              fieldGroups: [],
              conditions: null,
              variables: null,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The workflow has been successfully created.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'New Workflow',
        description: 'This is a new workflow',
        image: 'https://example.com/image.png',
        enabled: true,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        nodes: [
          {
            id: 'node1',
            type: 'type1',
            name: 'Node 1',
            serviceName: 'Service 1',
            dependsOn: [],
            fieldGroups: [],
            conditions: null,
            variables: null,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  async createWorkflow(@Body() data: CreateWorkflowDto, @Req() req: any) {
    return this.workflowService.createWorkflow(data, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a workflow by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the workflow to retrieve',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful Response',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Workflow 1',
        description: 'Description of Workflow 1',
        image: 'https://example.com/image1.png',
        enabled: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        nodes: [
          {
            id: 'node1',
            type: 'type1',
            name: 'Node 1',
            serviceName: 'Service 1',
            dependsOn: [],
            fieldGroups: [],
            conditions: null,
            variables: null,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @HttpCode(200)
  async getWorkflowById(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id; // Récupère l'ID utilisateur depuis le token
    return this.workflowService.getWorkflowById(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all workflows for a user' })
  @ApiResponse({
    status: 200,
    description: 'Successful Response',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Workflow 1',
          description: 'Description of Workflow 1',
          image: 'https://example.com/image1.png',
          enabled: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          nodes: [
            {
              id: 'node1',
              type: 'type1',
              name: 'Node 1',
              serviceName: 'Service 1',
              dependsOn: [],
              fieldGroups: [],
              conditions: null,
              variables: null,
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  async getWorkflowsByUser(@Req() req: any) {
    const loggedInUserId = req.user.id; // ID utilisateur connecté
    console.log('Fetching workflows for user:', loggedInUserId);
    return this.workflowService.getWorkflowsByUser(loggedInUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing workflow' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the workflow to update',
    required: true,
    type: String,
  })
  @ApiBody({
    type: updateWorkflowDto,
    examples: {
      example1: {
        summary: 'Example update workflow',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          data: {
            name: 'Updated Workflow',
            description: 'This is an updated workflow',
            image: 'https://example.com/updated-image.png',
            enabled: false,
            nodes: [
              {
                id: 'node1',
                type: 'type1',
                name: 'Updated Node 1',
                serviceName: 'Updated Service 1',
                dependsOn: [],
                fieldGroups: [],
                conditions: null,
                variables: null,
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The workflow has been successfully updated.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Updated Workflow',
        description: 'This is an updated workflow',
        image: 'https://example.com/updated-image.png',
        enabled: false,
        nodes: [
          {
            id: 'node1',
            type: 'type1',
            name: 'Updated Node 1',
            serviceName: 'Updated Service 1',
            dependsOn: [],
            fieldGroups: [],
            conditions: null,
            variables: null,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  async updateWorkflow(
    @Body() data: updateWorkflowDto,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user.id;
    return this.workflowService.updateWorkflow(data, userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an existing workflow' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the workflow to delete',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'The workflow has been successfully deleted.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @HttpCode(204)
  async deleteWorkflow(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.workflowService.deleteWorkflow(id, userId);
  }
}
