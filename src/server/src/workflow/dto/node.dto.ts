import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NodeDto {
  @IsString()
  id_node: string;

  @IsString()
  type: string; // 'action' ou 'reaction'

  @IsString()
  name: string; // Nom du node (ex: "New Video Published")

  @IsString()
  serviceName: string; // Nom du service (ex: "YouTube")

  @IsArray()
  fieldGroups: any[]; // Informations supplémentaires sous forme de tableau

  @IsOptional()
  @IsArray()
  conditions?: any[]; // Conditions optionnelles

  @IsOptional()
  @IsArray()
  variables?: any[]; // Variables optionnelles

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  children: NodeDto[];
}
