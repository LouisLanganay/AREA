import { BadRequestException, Injectable } from '@nestjs/common';
import * as process from 'node:process';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GoogleAuthService {
  constructor(private httpService: HttpService) {}

  // Méthode pour échanger le code d'autorisation contre des tokens
  async exchangeCodeForTokensGoogle(
    code: string,
    redirect_uri: string = process.env.GOOGLE_REDIRECT_URI,
  ): Promise<any> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    // Données nécessaires pour échanger le code contre les tokens
    const tokenData = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code',
    };
    try {
      // Effectuer une requête POST pour obtenir les tokens
      const tokenResponse = await this.httpService.axiosRef.post(
        tokenUrl,
        tokenData,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      // Retourne les tokens obtenus depuis Google
      return tokenResponse.data; // access_token, refresh_token, id_token, expires_in, etc.
    } catch (error) {
      console.error(
        'Error exchanging code for tokens:',
        error.response?.data || error.message,
      );
      throw new BadRequestException({
        err_code: 'GOOGLE_TOKEN_EXCHANGE_FAILED',
      });
    }
  }

  async getUserInfoGoogle(accessToken: string) {
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v1/userinfo';

    const response = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info from Google');
    }

    return response.json();
  }

  async loginGoogle(code: string) {
    const tokens = await this.exchangeCodeForTokensGoogle(code);
    if (!tokens) {
      return null;
    }
    return await this.getUserInfoGoogle(tokens.access_token);
  }
}
