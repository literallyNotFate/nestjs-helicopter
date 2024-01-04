import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { Engine } from '../engine/entities/engine.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeHelicopter } from '../attribute-helicopter/entities/attribute-helicopter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Helicopter,
      Engine,
      Attribute,
      AttributeHelicopter,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
