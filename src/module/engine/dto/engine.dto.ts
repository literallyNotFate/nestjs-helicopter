import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HelicopterDto } from 'src/module/helicopter/dto/helicopter.dto';

export class EngineDto {
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
    example: 'Ultra Engine',
    nullable: false,
    type: String,
  })
  name!: string;

  @ApiProperty({
    example: 2023,
    nullable: false,
    type: Number,
  })
  year!: number;

  @ApiProperty({
    example: 'NT-200',
    nullable: false,
    type: String,
  })
  model!: string;

  @ApiPropertyOptional({
    type: () => HelicopterDto,
  })
  helicopters?: HelicopterDto[];
}
