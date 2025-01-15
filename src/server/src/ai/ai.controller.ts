import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenerateWorkflowDto } from './dto/generate-workflow.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-workflow')
  @ApiOperation({ summary: 'Generate a workflow using OpenAI' })
  @ApiResponse({
    status: 201,
    description: 'Workflow generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or invalid input',
  })
  @ApiResponse({
    status: 500,
    description: 'OpenAI API error or internal server error',
  })
  async generateWorkflow(@Body() generateWorkflowDto: GenerateWorkflowDto) {
    return this.aiService.generateWorkflow(generateWorkflowDto);
  }
}
