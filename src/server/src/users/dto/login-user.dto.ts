import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: "User's ID or username for login",
    example: 'username123',
  })
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: "User's password",
    example: 'password123',
  })
  @IsNotEmpty()
  password: string;
}
