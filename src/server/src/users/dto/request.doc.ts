import { ApiProperty } from '@nestjs/swagger';
import { getMe_response } from '../../../../shared/user/user_route';

export class UserDetailSuccess implements getMe_response {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: "User's email address",
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Unique username of the user',
    example: 'username123',
  })
  username: string;

  @ApiProperty({
    description: 'Display name of the user (optional)',
    example: 'John Doe',
    required: false,
  })
  displayName?: string;

  @ApiProperty({
    description: "URL of the user's avatar (optional)",
    example: 'https://example.com/avatar.png',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description:
      'Timestamp when the user was created (in milliseconds since epoch)',
    example: 1609459200000,
  })
  createdAt: number;

  @ApiProperty({
    description:
      'Timestamp when the user was last updated (in milliseconds since epoch)',
    example: 1612137600000,
  })
  updatedAt: number;

  @ApiProperty({
    description:
      "Timestamp of the user's last connection (in milliseconds since epoch, optional)",
    example: 1614816000000,
    required: false,
  })
  lastConnection?: number;
}
