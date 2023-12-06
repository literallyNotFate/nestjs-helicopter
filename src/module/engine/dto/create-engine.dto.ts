import { ApiProperty } from '@nestjs/swagger';

export class CreateEngineDto {
  @ApiProperty({
    example: 'Engine XYZ',
    nullable: false,
    type: String,
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 2023,
    type: Number,
    nullable: false,
    required: true,
  })
  year: number;

  @ApiProperty({
    example: 'Model ABC',
    type: String,
    nullable: false,
    required: true,
  })
  model!: string;

  @ApiProperty({
    example: 300,
    type: Number,
    nullable: false,
    required: true,
  })
  hp!: number;

  @ApiProperty({
    example: 1,
    type: Number,
    nullable: false,
  })
  helicopterId?: number;
}
