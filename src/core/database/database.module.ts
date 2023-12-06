import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'helicopters',
      entities: [join(__dirname, '../src/module/**/*.entity{.ts,.js}')],
      synchronize: true,
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
