import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        return {
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'test_user',
          password: 'test_pass',
          database: 'test_helicopters',
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          synchronize: true,
          autoLoadEntities: true,
          logging: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}

// return {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'admin',
//   database: 'helicopters',
//   entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
//   synchronize: true,
//   autoLoadEntities: true,
//   logging: true,
// };
