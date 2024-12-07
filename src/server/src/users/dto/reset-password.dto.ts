import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'New password for the user (minimum 6 characters)',
    example: 'newpassword123',
  })
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({
    description: 'Token received via email for password reset',
    example: 'abc123token',
  })
  @IsNotEmpty()
  token: string;
}
