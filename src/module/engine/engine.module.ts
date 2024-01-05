import { Module } from '@nestjs/common';
import { EngineService } from './engine.service';
import { EngineController } from './engine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engine } from './entities/engine.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { AuthModule } from '../../core/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Engine, Helicopter]), AuthModule],
  controllers: [EngineController],
  providers: [EngineService],
  exports: [EngineService],
})
export class EngineModule {}
