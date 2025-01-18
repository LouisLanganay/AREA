import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      console.log(e);
      console.error('Error connecting to the database');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
