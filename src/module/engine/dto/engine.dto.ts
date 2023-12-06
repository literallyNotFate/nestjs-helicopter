import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HelicopterDto } from 'src/module/helicopter/dto/helicopter.dto';

export class EngineDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: '2023-05-12T13:55:37.839Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-12T13:55:37.839Z',
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({ example: 'Engine XYZ', type: String, nullable: false })
  name!: string;

  @ApiProperty({
    example: 2023,
    type: Number,
    nullable: false,
  })
  year!: number;

  @ApiProperty({ example: 'Model ABC', type: String, nullable: false })
  model!: string;

  @ApiProperty({
    example: 300,
    type: Number,
    nullable: false,
  })
  hp!: number;

  @ApiPropertyOptional({
    example: 1,
    type: Number,
    nullable: false,
  })
  helicopterId!: number;

  @ApiPropertyOptional({
    type: [HelicopterDto],
    isArray: true,
  })
  helicopters: HelicopterDto[];
}
