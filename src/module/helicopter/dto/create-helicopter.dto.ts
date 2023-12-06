import { ApiProperty } from '@nestjs/swagger';

export class CreateHelicopterDto {
  @ApiProperty({
    example: 'ABC-1101',
    nullable: false,
    type: String,
  })
  model!: string;

  @ApiProperty({
    example: 2023,
    nullable: false,
    type: Number,
  })
  year!: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  engineId!: number;
}
