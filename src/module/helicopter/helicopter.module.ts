import { Module } from '@nestjs/common';
import { HelicopterService } from './helicopter.service';
import { HelicopterController } from './helicopter.controller';
import { Helicopter } from './entities/helicopter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Helicopter])],
  controllers: [HelicopterController],
  providers: [HelicopterService],
})
export class HelicopterModule {}
