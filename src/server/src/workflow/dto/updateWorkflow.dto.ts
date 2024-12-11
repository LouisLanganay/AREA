import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class updateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  nodes?: any;

  @IsOptional()
  updatedAt?: Date;
}
