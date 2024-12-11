import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '../mailer/mailer.service';
import * as process from 'node:process';
import { ResetPasswordDto } from '../users/dto/reset-password.dto';
import { GoogleAuthService } from './external-services/google.auth.service';
import { DiscordAuthService } from './external-services/discord.auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly discordService: DiscordAuthService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    try {
      const hashed = await bcrypt.hash(password, 10);
      return hashed;
    } catch (error) {
      console.error('Erreur lors du hachage du mot de passe :', error);
      throw new InternalServerErrorException({ err_code: 'HACH_FAIL' });
    }
  }

  async register(createUserDto: CreateUserDto) {
    // check if the mail is core
    createUserDto.password = await this.hashPassword(createUserDto.password);
    const user = await this.usersService.create(createUserDto);
    if (!user) {
      throw new InternalServerErrorException({ err_code: 'USER_NOT_CREATED' });
    }
    await this.sendRegisterEmail(user);
    return {
      access_token: this.jwtService.sign({ id: user.id }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findForLogin(loginUserDto.id);
    if (!user || user.provider !== 'local') {
      throw new UnauthorizedException({
        err_code: 'USER_NOT_FOUND',
      });
    }
    if (!user.password) {
      throw new UnauthorizedException({ err_code: 'USER_NOT_LOCAL_REG' });
    }
    const passwordMatch = await compare(loginUserDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException({ err_code: 'INVALID_CREDENTIAL' });
    }
    const payload = { id: user.id };
    await this.usersService.setLastConnection(user.id);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async UserGoogle(user: any) {
    const userExist = await this.usersService.checkUserEmailExist(
      user.email,
      'google',
    );
    if (!userExist) {
      const createUserDto = {
        email: user.email,
        username: await this.usersService.getUnusedUsername(user.firstName),
        displayName: user.firstName,
        provider: 'google',
        avatarUrl: user.picture,
      };
      await this.usersService.registerExternal(createUserDto);
      await this.sendRegisterEmail(createUserDto, 'google');
    }
    const userData = await this.usersService.findByEmail(user.email, 'google');
    const payload = { id: userData.id };
    await this.usersService.setLastConnection(payload.id);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async UserDiscord(user: any) {
    const userExist = await this.usersService.checkUserEmailExist(
      user.email,
      'discord',
    );
    if (!userExist) {
      let avatar = null;
      if (user.avatar)
        avatar =
          'https://cdn.discordapp.com/avatars/' +
          user.id +
          '/' +
          user.avatar +
          '.png';
      const createUserDto = {
        email: user.email,
        username: await this.usersService.getUnusedUsername(user.username),
        displayName: user.username,
        avatarUrl: avatar,
        provider: 'discord',
      };
      await this.usersService.registerExternal(createUserDto);
      await this.sendRegisterEmail(createUserDto, 'discord');
    }
    const userData = await this.usersService.findByEmail(user.email, 'discord');
    const payload = { id: userData.id };
    await this.usersService.setLastConnection(payload.id);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email, 'local');

    if (!user) {
      throw new NotFoundException({
        err_code: 'USER_NOT_FOUND',
      });
    }

    const token = uuidv4();

    if (!process.env.IP_FRONT) {
      throw new InternalServerErrorException({
        err_code: 'INTERNAL_FRONT_URL',
      });
    }
    await this.usersService.resetOtherResetRequest(user.id);
    console.log(user);
    await this.usersService.createResetPassword(user.id, token);

    const resetLink =
      process.env.IP_FRONT + 'reset-password' + '?token=' + token;
    const isSend = await this.mailerService.sendEmailWithTemplate(
      [user.email],
      'Réinitialisation de mot de passe',
      'forgot_password',
      { resetLink: resetLink, websiteLink: process.env.IP_FRONT },
    );
    if (isSend) {
      throw new InternalServerErrorException({
        err_code: 'FAIL_SEND_MAIL',
        message: 'Error sending email please try again or contact support',
      });
    }
    return {
      message: 'Email sent',
    };
  }

  async sendRegisterEmail(
    user: { email: string; username: string },
    via?: string,
  ) {
    if (!via) via = 'local';
    await this.mailerService.sendEmailWithTemplate(
      [user.email],
      'Inscription',
      'register',
      {
        firstName: user.username,
        websiteLink: process.env.IP_FRONT,
      },
    );
  }

  async resetPassword(data: ResetPasswordDto) {
    const reset = await this.usersService.findToken(data.token);
    if (!reset) {
      throw new NotFoundException({ err_code: 'INVALID_TOKEN' });
    }
    if (reset.used) {
      throw new BadRequestException({ err_code: 'TOKEN_EXPIRED' });
    }
    if (reset.expiresAt < new Date()) {
      throw new NotFoundException({ err_code: 'TOKEN_EXPIRED' });
    }
    const hash = await this.hashPassword(data.password);
    const user = await this.usersService.resetPassword(reset.userId, hash);
    await this.usersService.resetToken(data.token);
    if (!user) {
      throw new NotFoundException({
        err_code: 'USER_NOT_FOUND_RESET',
      });
    }
    await this.mailerService.sendEmailWithTemplate(
      [user.email],
      'Mot de passe Linkit réinitialisé avec succès',
      'reset_password',
      { username: user.username },
    );
    return {
      message: 'Password reset',
    };
  }

  async googleOAuth(code: string) {
    const test = await this.googleAuthService.loginGoogle(code);
    if (!test) return;
    const userExist = await this.usersService.checkUserEmailExist(
      test.email,
      'google',
    );
    if (!userExist) {
      const createUserDto = {
        email: test.email,
        username: await this.usersService.getUnusedUsername(test.given_name),
        displayName: test.given_name,
        provider: 'google',
        avatarUrl: test.picture,
      };
      await this.usersService.registerExternal(createUserDto);
      await this.sendRegisterEmail(createUserDto, 'google');
    }
    const userData = await this.usersService.findByEmail(test.email, 'google');
    if (!userData) {
      throw new InternalServerErrorException({
        err_code: 'USER_CREATION_FAIL_GG',
      });
    }
    return {
      access_token: this.jwtService.sign({ id: userData.id }),
    };
  }

  async discordOauth(code: string) {
    const userExtData = await this.discordService.loginDiscord(code);

    if (!userExtData) return;
    const userExist = await this.usersService.checkUserEmailExist(
      userExtData.email,
      'discord',
    );
    if (!userExist) {
      let avatar = null;
      if (userExtData.avatar)
        avatar =
          'https://cdn.discordapp.com/avatars/' +
          userExtData.id +
          '/' +
          userExtData.avatar +
          '.png';
      const createUserDto = {
        email: userExtData.email,
        username: await this.usersService.getUnusedUsername(
          userExtData.username,
        ),
        displayName: userExtData.username,
        avatarUrl: avatar,
        provider: 'discord',
      };
      await this.usersService.registerExternal(createUserDto);
      await this.sendRegisterEmail(createUserDto, 'discord');
    }
    const userData = await this.usersService.findByEmail(
      userExtData.email,
      'discord',
    );
    if (!userData) {
      throw new InternalServerErrorException({
        err_code: 'USER_CREATION_FAIL_DC',
      });
    }
    return {
      access_token: this.jwtService.sign({ id: userData.id }),
    };
  }
}
