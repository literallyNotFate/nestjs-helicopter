import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EngineDto } from 'src/module/engine/dto/engine.dto';

export class HelicopterDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
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

  @ApiPropertyOptional({
    type: () => EngineDto,
  })
  engine?: EngineDto;
}
