import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsPositive } from 'class-validator';

export class CreateHelicopterDto {
  @ApiProperty({
    example: 'ABC-1101',
    nullable: false,
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({
    example: 2023,
    nullable: false,
    type: Number,
    required: true,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  year!: number;

  @ApiProperty({
    example: 1,
    type: Number,
    required: true,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  engineId!: number;

  @ApiProperty({
    example: 1,
    type: Number,
    required: true,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  attributeHelicopterId!: number;
}
