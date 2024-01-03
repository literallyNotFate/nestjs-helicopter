import { Exclude, Expose, Type } from 'class-transformer';
import { AttributeHelicopterResponseDto } from '../../attribute-helicopter/dto/attribute-helicopter-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EngineDto } from '../../engine/dto/engine.dto';
import {
  IsInt,
  IsPositive,
  IsDate,
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
} from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';

@Exclude()
// export class HelicopterDto implements Helicopter
export class HelicopterDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @Expose()
  id: number;

  @ApiProperty({
    example: '2023-05-12T13:55:37.839Z',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-12T13:55:37.839Z',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: 'ABC-1101',
    nullable: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  model!: string;

  @ApiProperty({
    example: 2023,
    nullable: false,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Expose()
  year!: number;

  @ApiPropertyOptional({
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Expose()
  engineId!: number;

  @ApiPropertyOptional({
    type: () => EngineDto,
  })
  @Type(() => EngineDto)
  @IsObject()
  @IsOptional()
  @Expose()
  engine?: EngineDto;

  @ApiPropertyOptional({
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Expose()
  attributeHelicopterId!: number;

  @ApiPropertyOptional({ type: () => AttributeHelicopterResponseDto })
  @Type(() => AttributeHelicopterResponseDto)
  @IsObject()
  @IsOptional()
  @Expose()
  attributeHelicopter?: AttributeHelicopterResponseDto;

  @ApiPropertyOptional({ type: () => UserDto })
  @Type(() => UserDto)
  @IsObject()
  @IsOptional()
  @Expose()
  creator?: UserDto;
}
