import { Module } from '@nestjs/common';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { AttributeHelicopterController } from './attribute-helicopter.controller';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AttributeHelicopter])],
  controllers: [AttributeHelicopterController],
  providers: [AttributeHelicopterService],
})
export class AttributeHelicopterModule {}
