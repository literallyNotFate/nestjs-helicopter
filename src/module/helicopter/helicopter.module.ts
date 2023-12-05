import { Module } from '@nestjs/common';
import { HelicopterService } from './helicopter.service';
import { HelicopterController } from './helicopter.controller';

@Module({
  controllers: [HelicopterController],
  providers: [HelicopterService],
})
export class HelicopterModule {}
