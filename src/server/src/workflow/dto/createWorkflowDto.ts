import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NodeDto } from './node.dto';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  image: string;

  @IsBoolean()
  enabled: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  triggers: NodeDto[];
}
