import { Module } from '@nestjs/common';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { AttributeHelicopterController } from './attribute-helicopter.controller';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from '../attributes/entities/attribute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttributeHelicopter, Attribute])],
  controllers: [AttributeHelicopterController],
  providers: [AttributeHelicopterService],
})
export class AttributeHelicopterModule {}
