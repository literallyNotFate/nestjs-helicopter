import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeHelicopter } from '../attribute-helicopter/entities/attribute-helicopter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute, AttributeHelicopter])],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
