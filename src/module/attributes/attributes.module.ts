import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeHelicopter } from '../attribute-helicopter/entities/attribute-helicopter.entity';
import { AuthModule } from '../../core/auth/auth.module';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { AttributeCreatorGuard } from '../../common/guards/attribute-creator.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, AttributeHelicopter]),
    AuthModule,
  ],
  controllers: [AttributesController],
  providers: [AttributesService, JwtAuthGuard, AttributeCreatorGuard],
  exports: [AttributesService],
})
export class AttributesModule {}
