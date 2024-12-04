import { IsString } from 'class-validator';

export class updateUserDto {
  @IsString()
  id: string;

  data: any;
}
