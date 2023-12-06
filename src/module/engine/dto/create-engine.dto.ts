import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsPositive } from 'class-validator';

export class CreateEngineDto {
  @ApiProperty({
    example: 'Engine XYZ',
    nullable: false,
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 2023,
    type: Number,
    nullable: false,
    required: true,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  year!: number;

  @ApiProperty({
    example: 'Model ABC',
    type: String,
    nullable: false,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({
    example: 300,
    type: Number,
    nullable: false,
    required: true,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  hp!: number;
}
