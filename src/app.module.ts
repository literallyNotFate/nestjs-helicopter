import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ValidationPipe } from '@nestjs/common/pipes';
import { DatabaseModule } from './core/database/database.module';
import { Modules } from './module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [DatabaseModule, ...Modules],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
