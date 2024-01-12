import { Module } from '@nestjs/common';
import { HelicopterService } from './helicopter.service';
import { HelicopterController } from './helicopter.controller';
import { Helicopter } from './entities/helicopter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engine } from '../engine/entities/engine.entity';
import { AttributeHelicopter } from '../attribute-helicopter/entities/attribute-helicopter.entity';
import { AuthModule } from '../../core/auth/auth.module';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { HelicopterCreatorGuard } from '../../common/guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([Helicopter, Engine, AttributeHelicopter]),
    AuthModule,
  ],
  controllers: [HelicopterController],
  providers: [HelicopterService, JwtAuthGuard, HelicopterCreatorGuard],
  exports: [HelicopterService],
})
export class HelicopterModule {}
