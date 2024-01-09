import { Module } from '@nestjs/common';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { AttributeHelicopterController } from './attribute-helicopter.controller';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from '../attributes/entities/attribute.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { AuthModule } from '../../core/auth/auth.module';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { AttributeHelicopterCreatorGuard } from '../../common/guards/attribute-helicopter-creator.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttributeHelicopter, Attribute, Helicopter]),
    AuthModule,
  ],
  controllers: [AttributeHelicopterController],
  providers: [
    AttributeHelicopterService,
    JwtAuthGuard,
    AttributeHelicopterCreatorGuard,
  ],
  exports: [AttributeHelicopterService],
})
export class AttributeHelicopterModule {}
