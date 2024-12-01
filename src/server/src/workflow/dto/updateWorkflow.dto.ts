import { IsString } from 'class-validator';

export class updateWorkflowDto {
  @IsString()
  id: string;

  data: any;
}
