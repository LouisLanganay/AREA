import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Rendre PrismaService disponible globalement si nécessaire
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporter PrismaService pour l'utiliser dans d'autres modules
})
export class PrismaModule {}
