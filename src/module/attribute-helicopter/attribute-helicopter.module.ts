import { Module } from '@nestjs/common';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { AttributeHelicopterController } from './attribute-helicopter.controller';

@Module({
  controllers: [AttributeHelicopterController],
  providers: [AttributeHelicopterService],
})
export class AttributeHelicopterModule {}
