import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AboutController } from './about/about.controller';

@Module({
  imports: [],
  controllers: [AppController, AboutController],
  providers: [AppService],
})
export class AppModule {}
