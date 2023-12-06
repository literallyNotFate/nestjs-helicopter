import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { Modules } from './module';

@Module({
  imports: [DatabaseModule, ...Modules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
