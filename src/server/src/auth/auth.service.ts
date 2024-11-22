import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(createUserDto: CreateUserDto) {
        // check if the mail is core
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.usersService.create({ ...createUserDto, password: hashedPassword });
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.usersService.findByEmail(loginUserDto.email);
        if (!user || !(bcrypt.compare(loginUserDto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.usersService.findByEmail(forgotPasswordDto.email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        // Implémentation de l'envoi d'email ou autre méthode pour gérer le mot de passe oublié
        return { message: 'Password reset link sent to your email' };
    }
}
