import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post, Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { AuthGuard } from '@nestjs/passport';
import * as process from 'node:process';
import { ResetPasswordDto } from '../users/dto/reset-password.dto';
import {DiscordService} from "../app-discord/discord-app.service";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly discordService: DiscordService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Cette méthode redirige vers Google pour l'authentification
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const token = await this.authService.UserGoogle(req.user);
    return this.redirectFrontend(req.res, token);
  }

  private async redirectFrontend(res, token) {
    const frontendRedirectUrl = `${process.env.IP_FRONT}login-success?token=${token.access_token}`;
    return res.redirect(frontendRedirectUrl);
  }

  //retourne le dans le body le lien de redirection
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {
    const redirectUrl = `${process.env.IP_REDIRECT}auth/discord/redirect`;
    return { redirectUrl };
  }

  @Get('discord/redirect')
  @UseGuards(AuthGuard('discord'))
  async discordAuthRedirect(@Req() req, @Res() res) {
    const token = await this.authService.UserDiscord(req.user);
    return this.redirectFrontend(res, token);
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  @UseGuards(AuthGuard('jwt'))
  async getDiscordCallback(
      @Query('code') code: string,
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
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
