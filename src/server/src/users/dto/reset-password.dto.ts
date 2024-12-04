import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(1, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsNotEmpty()
  token: string;
}
