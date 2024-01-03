import { Module } from '@nestjs/common';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { AttributeHelicopterController } from './attribute-helicopter.controller';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from '../attributes/entities/attribute.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttributeHelicopter, Attribute, Helicopter]),
  ],
  controllers: [AttributeHelicopterController],
  providers: [AttributeHelicopterService],
  exports: [AttributeHelicopterService],
})
export class AttributeHelicopterModule {}
