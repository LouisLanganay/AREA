import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {
    // Cette méthode redirige vers Discord pour l'authentification
  }

  @Get('discord/redirect')
  @UseGuards(AuthGuard('discord'))
  async discordAuthRedirect(@Req() req, @Res() res) {
    const token = await this.authService.UserDiscord(req.user);
    return this.redirectFrontend(res, token);
  }

  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
