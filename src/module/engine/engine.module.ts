import { Module } from '@nestjs/common';
import { EngineService } from './engine.service';
import { EngineController } from './engine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engine } from './entities/engine.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Engine, Helicopter])],
  controllers: [EngineController],
  providers: [EngineService],
})
export class EngineModule {}
