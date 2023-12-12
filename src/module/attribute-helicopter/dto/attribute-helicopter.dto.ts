import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributesDto } from '../../attributes/dto/attributes.dto';
import { HelicopterDto } from '../../helicopter/dto/helicopter.dto';

export class AttributeHelicopterDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  updatedAt: Date;

  @ApiProperty({
    example: 'Value XYZ',
    nullable: false,
    type: String,
  })
  value!: string;

  @ApiProperty({
    example: 1,
    type: Number,
    nullable: false,
  })
  attributeId!: number;

  @ApiPropertyOptional({
    type: AttributesDto,
  })
  attribute?: AttributesDto;

  @ApiPropertyOptional({
    type: [HelicopterDto],
    isArray: true,
  })
  helicopters?: HelicopterDto[];
}
