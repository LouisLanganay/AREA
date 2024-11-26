import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async register(createUserDto: CreateUserDto) {
    // check if the mail is core
    createUserDto.password = await this.hashPassword(createUserDto.password);
    const user = await this.usersService.create(createUserDto);
    if (!user) {
      throw new InternalServerErrorException('User not created');
    }
    await this.mailerService.sendEmail(
      [user.data.email],
      'Inscription',
      `Bonjour ${user.data.username}, vous vous êtes inscrit à ${new Date().toISOString()}`,
    );
    return { message: user.message };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findForLogin(loginUserDto.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const passwordMatch = await compare(loginUserDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, id: user.id };
    await this.usersService.setLastConnection(user.id);

    await this.mailerService.sendEmail(
      [user.email],
      'Connexion',
      `Bonjour ${user.email}, vous vous êtes connecté à ${new Date().toISOString()}`,
    );
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    //   const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    //   if (!user) {
    //     throw new UnauthorizedException('User not found');
    //   }
    //   // Implémentation de l'envoi d'email ou autre méthode pour gérer le mot de passe oublié
    //   return { message: 'Password reset link sent to your email' };
  }
}
