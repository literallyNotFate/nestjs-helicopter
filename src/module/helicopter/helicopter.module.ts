import { Module } from '@nestjs/common';
import { HelicopterService } from './helicopter.service';
import { HelicopterController } from './helicopter.controller';
import { Helicopter } from './entities/helicopter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engine } from '../engine/entities/engine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Helicopter, Engine])],
  controllers: [HelicopterController],
  providers: [HelicopterService],
})
export class HelicopterModule {}
