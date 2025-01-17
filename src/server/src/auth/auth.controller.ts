import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { AuthGuard } from '@nestjs/passport';
import * as process from 'node:process';
import { ResetPasswordDto } from '../users/dto/reset-password.dto';
import { DiscordService } from '../app-discord/discord-app.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SpotifyAuthService } from './external-services/spotify.auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly discordService: DiscordService,
    private readonly spotifyAuthService: SpotifyAuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Example registration',
        value: {
          email: 'newuser@example.com',
          password: 'password123',
          username: 'newuser',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({
    type: LoginUserDto,
    examples: {
      example1: {
        summary: 'Example login',
        value: {
          email: 'existinguser@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    schema: {
      example: {
        err_code: 'ERR_CODE',
      },
    },
  })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      example1: {
        summary: 'Example forgot password request',
        value: {
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email sent',
    schema: {
      example: {
        message: 'Email sent',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        err_code: 'USER_NOT_FOUND',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        err_code: 'INTERNAL_FRONT_URL',
      },
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Get('google/redirect/:service')
  async googleAuthRedirect(@Param('service') service: string) {
    if (service !== 'gcalendar') {
      return;
    }
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const BASE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const redirectUrl = `${BASE_AUTH_URL}?response_type=code&client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(
      '[REDIRECT_URI]',
    )}&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&access_type=offline&prompt=consent`;

    return { redirectUrl };
  }

  @Post('google/callback/:service')
  @UseGuards(AuthGuard('jwt'))
  async googleAuthCallback(
    @Param('service') service: string,
    @Body('code') code: string,
    @Req() req: any,
  ) {
    if (!code) {
      throw new BadRequestException('Code is missing');
    }
    if (service === 'gcalendar') {
      return await this.authService.gCalendarRedirect(code, req.user.id);
    }
  }

  @Get('discord/redirect')
  async discordAuthRedirect(@Req() req) {
    const redirectUrl = await this.discordService.getRedirectUrl();
    return { redirectUrl };
  }

  //retourne le dans le body le lien de redirection
  //@Get('discord')
  async discordAuth() {
    const redirectUrl = await this.discordService.getRedirectUrl();
    console.log('Redirecting to Discord OAuth:', redirectUrl);
    return { redirectUrl: redirectUrl };
  }

  @Post('discord/callback')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Discord OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Tokens stored in the database',
    schema: {
      example: {
        message: 'Tokens stored in the database',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      example: {
        err_code: 'INVALID_TOKEN',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        err_code: 'UNAUTHORIZED',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        err_code: 'INTERNAL_SERVER_ERROR',
      },
    },
  })
  async getDiscordCallback(
    // code dans le body
    @Body('code') code: string,
    // req en classique
    @Req() req: any,
  ): Promise<any> {
    console.log('Discord OAuth callback received:', code);
    if (!code) {
      throw new BadRequestException('Code or userId is missing');
    }
    await this.discordService.discordCallback(code, req);
  }

  @HttpCode(200)
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      example1: {
        summary: 'Example reset password request',
        value: {
          token: 'some-reset-token',
          password: 'newpassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password reset',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      example: {
        err_code: 'TOKEN_EXPIRED',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Token not found or expired',
    schema: {
      example: {
        err_code: 'INVALID_TOKEN',
      },
    },
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('google')
  @ApiOperation({ summary: 'Google OAuth, route for receive code from google' })
  @ApiResponse({
    status: 200,
    description: 'Tokens stored in the database',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiBody({
    type: String,
    examples: {
      example1: {
        summary: 'Example google oauth',
        value: {
          code: 'code',
        },
      },
    },
  })
  async googleOAuth(@Body('code') code: string) {
    if (!code) {
      throw new BadRequestException('Code is missing');
    }
    return await this.authService.googleOAuth(code);
  }

  @Post('discord')
  async discordOAuth(@Body('code') code: string) {
    if (!code) {
      throw new BadRequestException('Code is missing');
    }
    return await this.authService.discordOauth(code);
  }

  @Get('createAdmin')
  @ApiOperation({ summary: 'Create an admin user default for test' })
  async createAdmin() {
    return await this.authService.createAdmin();
  }

  @Get('spotify/redirect')
  spotifyAuthRedirect(): { redirectUrl: string } {
    const redirectUrl = this.spotifyAuthService.generateAuthUrl();
    return { redirectUrl };
  }

  @Post('spotify/callback')
  @UseGuards(AuthGuard('jwt'))
  async getSpotifyCallback(@Body('code') code: string, @Req() req: any) {
    if (!code) {
      throw new BadRequestException('Code is missing');
    }
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is missing');
    }
    try {
      console.log('AUTH: Exchanging code for tokens');
      await this.spotifyAuthService.getAccessToken(code, userId);
      return { message: 'Tokens stored in the database' };
    } catch (error) {
      throw new BadRequestException({
        err_code: 'SPOTIFY_TOKEN_EXCHANGE_FAILED',
        details: error.message,
      });
    }
  }
}
