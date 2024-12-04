import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class updateUserDto {
  @IsOptional()
  @IsEmail()
  @ApiProperty({
    name: 'email',
    description: 'new email of user example: email@email.eu',
  })
  email?: string;

  @ApiProperty({
    name: 'displayName',
    description: 'New display name of user, example : Potiron32',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    name: 'avatarUrl',
    description: 'New url of avatar',
  })
  avatarUrl?: string;
}
