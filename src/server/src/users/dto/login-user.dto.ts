import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  password: string;
}
