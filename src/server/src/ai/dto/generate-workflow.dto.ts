import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateWorkflowDto {
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
