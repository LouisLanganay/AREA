import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @IsEmail({}, { message: 'Invalid email format' }) // Validation de l'email
    email: string;

    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}