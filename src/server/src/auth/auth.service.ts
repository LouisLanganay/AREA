import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import * as bcrypt from 'bcryptjs';
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

  async hashPassword(password: string): Promise<string> {
    try {
      const hashed = await bcrypt.hash(password, 10);
      return hashed;
    } catch (error) {
      console.error('Erreur lors du hachage du mot de passe :', error);
      throw new InternalServerErrorException('Password hashing failed');
    }
  }

  async register(createUserDto: CreateUserDto) {
    // check if the mail is core
    createUserDto.password = await this.hashPassword(createUserDto.password);
    console.log(createUserDto);
    const user = await this.usersService.create(createUserDto);
    if (!user) {
      throw new InternalServerErrorException('User not created');
    }
    await this.mailerService.sendEmail(
      [user.email],
      'Inscription',
      `Bonjour ${user.username}, vous vous êtes inscrit à ${new Date().toISOString()}`,
    );
    return this.jwtService.sign({ id: user.id });
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findForLogin(loginUserDto.id);
    if (!user) {
      throw new UnauthorizedException({
        err_code: 'USER_NOT_FOUND',
      });
    }
    if (!user.password) {
      throw new UnauthorizedException({ err_code: 'USER_NOT_LOCAL_REG' });
    }
    const passwordMatch = await compare(loginUserDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { id: user.id };
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

  async UserGoogle(user: any) {
    const userExist = await this.usersService.checkUserEmailExist(user.email);
    console.log(userExist);
    if (!userExist) {
      const createUserDto = {
        email: user.email,
        username:
          user.firstName + Math.floor(Math.random() * 100) + user.lastName,
        displayName: user.firstName,
      };
      await this.usersService.registerExternal(createUserDto);
    }
    const userData = await this.usersService.findByEmail(user.email);
    const payload = { id: userData.id };
    await this.usersService.setLastConnection(payload.id);
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
