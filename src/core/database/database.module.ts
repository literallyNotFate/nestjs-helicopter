import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        return {
          type: 'postgres',
          host: 'localhost',
          port: 5434,
          username: 'test_user_2',
          password: 'test_pass_2',
          database: 'test_helicopters_2',
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
