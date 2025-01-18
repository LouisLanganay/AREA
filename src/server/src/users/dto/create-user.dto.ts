import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "User's email address",
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: "User's password (minimum 6 characters)",
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Unique username for the user',
    example: 'username123',
  })
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'Display name for the user (optional)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly displayName?: string;

  @ApiProperty({
    description: "URL of the user's avatar (optional)",
    example: 'https://example.com/avatar.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  readonly avatarUrl?: string;
}
