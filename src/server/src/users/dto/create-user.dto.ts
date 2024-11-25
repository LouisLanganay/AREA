import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string; // Adresse email obligatoire et unique

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string; // Mot de passe obligatoire

  @IsString()
  @IsNotEmpty()
  readonly username: string; // Nom d'utilisateur obligatoire et unique

  @IsOptional()
  @IsString()
  readonly displayName?: string; // Nom d'affichage optionnel

  @IsOptional()
  @IsUrl()
  readonly avatarUrl?: string; // URL de l'avatar optionnelle
}
