import { ApiProperty } from '@nestjs/swagger';

export class CreateHelicopterDto {
  @ApiProperty({
    example: 'ABC-1101',
    nullable: false,
    type: String,
    required: true,
  })
  model!: string;

  @ApiProperty({
    example: 2023,
    nullable: false,
    type: Number,
    required: true,
  })
  year!: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  engineId!: number;
}
