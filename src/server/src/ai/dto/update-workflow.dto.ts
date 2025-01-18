import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { GenerateWorkflowDto } from './generate-workflow.dto';

export class UpdateWorkflowDto extends GenerateWorkflowDto {
  @ApiProperty({
    description: 'Current workflow object to update',
    example: {
      name: "Email Reminder",
      description: "Send email at specific time",
      enabled: true,
      triggers: []
    },
  })
  @IsObject()
  @IsNotEmpty()
  workflow: any;

  @ApiProperty({
    description: 'OpenAI API Key',
    example: 'sk-...',
  })
  @IsString()
  @IsNotEmpty()
  openaiToken: string;

  @ApiProperty({
    description: 'Prompt for workflow generation',
    example: 'je veux un workflow qui permet de m\'envoyer un mail a 20h le 14/01/2025',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
