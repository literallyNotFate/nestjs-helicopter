import { Expose, Type, Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HelicopterDto } from '../../helicopter/dto/helicopter.dto';
import {
  IsInt,
  IsPositive,
  IsDate,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';

@Exclude()
export class EngineDto {
  @ApiProperty({ example: 1, type: Number })
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

  @ApiProperty({ example: 'Engine XYZ', type: String, nullable: false })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name!: string;

  @ApiProperty({
    example: 2023,
    type: Number,
    nullable: false,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  @Expose()
  year!: number;

  @ApiProperty({ example: 'Model ABC', type: String, nullable: false })
  @IsString()
  @IsNotEmpty()
  @Expose()
  model!: string;

  @ApiProperty({
    example: 300,
    type: Number,
    nullable: false,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  @Expose()
  hp!: number;

  @ApiPropertyOptional({
    type: [HelicopterDto],
    isArray: true,
  })
  @Type(() => HelicopterDto)
  @IsArray()
  @IsOptional()
  @Expose()
  helicopters?: HelicopterDto[];

  @ApiPropertyOptional({ type: () => UserDto })
  @Type(() => UserDto)
  @IsObject()
  @IsOptional()
  @Expose()
  creator?: UserDto;
}
