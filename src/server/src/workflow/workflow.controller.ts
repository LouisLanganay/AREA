import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Delete,
  Get,
  HttpCode,
  Patch,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/createWorkflowDto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateWorkflowDto } from './dto/updateWorkflow.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly userService: UsersService,
  ) {}

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
          triggers: [
            {
              id_node: 'node1',
              type: 'type1',
              name: 'Node 1',
              serviceName: 'Service 1',
              fieldGroups: [
                {
                  id: 'information_group_1',
                  name: 'information group 1',
                  description: 'this is a new group of information',
                  type: 'type 1',
                  fields: [
                    {
                      id: 'information 1',
                      type: 'type2',
                      required: true,
                      description: 'the first inforamtion',
                      value: 'the value depends on type',
                    },
                    {
                      id: 'information 2',
                      type: 'type2',
                      required: true,
                      description: 'the seconde inforamtion',
                      value: 'the value depends on type',
                    },
                  ],
                },
              ],
              children: ['a new node same as triggers'],
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
        id: 'workflow id ',
        userId: 'user id',
        name: 'name of workflow',
        description: 'workflow description',
        image: 'https://example.com/workflow.png',
        enabled: true,
        createdAt: 'timestamp',
        updatedAt: 'timestamp',
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
    const userId = req.user.id;
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
  async getWorkflowsByUser(@Req() req: any, @Query('all') all: string) {
    const loggedInUserId = req.user.id;
    if (all && all === 'true') {
      const isAdmin = await this.userService.checkRole(loggedInUserId, 'admin');
      if (!isAdmin) {
        throw new ForbiddenException({ err_code: 'USER_ADMIN' });
      }
      return this.workflowService.getAllWorkflows();
    }
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
    type: UpdateWorkflowDto,
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
    @Body() data: UpdateWorkflowDto,
    @Req() req: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  @UseGuards(AuthGuard('jwt'))
  @Get('run/:id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the workflow to run',
    required: true,
    type: String,
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run a workflow by ID' })
  @ApiResponse({
    status: 200,
    description: 'The workflow has been successfully run.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden you do not have the permission to run this workflow.',
  })
  @ApiResponse({
    status: 404,
    description: 'The workflow does not exist.',
  })
  async runWorkflow(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    await this.workflowService.runWorkflowByIdSecure(id, userId);
  }

  @Get(':id/history')
  @ApiParam({
    name: 'id',
    description: 'The ID of the workflow to get history',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The history of the workflow has been successfully retrieved.',
    schema: {
      example: {
        workflowId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Workflow 1',
        history: [
          { executionDate: '2025-01-15T10:41:35.665Z', status: 'sucess' },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'The workflow does not exist.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
  })
  @ApiOperation({ summary: 'Get the history of a workflow by ID' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getWorkflowHistory(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.workflowService.getWorkflowHistory(userId, id);
  }

  // @Get('/all')
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get all workflows (for admin)' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The workflows have been successfully retrieved.',
  //   schema: {
  //     example: [
  //       {
  //         id: '123e4567-e89b-12d3-a456-426614174000',
  //         name: 'Workflow 1',
  //         enabled: true,
  //         createdAt: '2023-01-01T00:00:00.000Z',
  //         updatedAt: '2023-01-02T00:00:00.000Z',
  //       },
  //     ],
  //   },
  // })
  // @ApiResponse({
  //   status: 403,
  //   description: 'Forbidden.',
  // })
  // @UseGuards(AuthGuard('jwt'))
  // async getAllWorkflows(@Req() req: any) {
  //   const userId = req.user.id;
  //   const isAdmin = await this.userService.checkRole(userId, 'admin');
  //   if (!isAdmin) {
  //     throw new ForbiddenException({ err_code: 'USER_ADMIN' });
  //   }
  //   return this.workflowService.getAllWorkflows();
  // }
}
