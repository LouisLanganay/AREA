import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: "User's email address to send the password reset link",
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
