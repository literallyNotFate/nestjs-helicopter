import { plainToInstance } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributesDto } from 'src/module/attributes/dto/attributes.dto';
import { HelicopterDto } from 'src/module/helicopter/dto/helicopter.dto';
import { AttributeHelicopter } from '../entities/attribute-helicopter.entity';

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
}

export class AttributeHelicopterResponseDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Object })
  attributeHelicopter: {
    attributeId: number;
    attribute: AttributesDto;
    value: string;
  }[];

  @ApiProperty({ type: [HelicopterDto] })
  helicopters: HelicopterDto[];

  public static ToResponse(
    data: AttributeHelicopter,
  ): AttributeHelicopterResponseDto {
    const responseDto = new AttributeHelicopterResponseDto();
    responseDto.id = data.id;
    responseDto.createdAt = data.createdAt;
    responseDto.updatedAt = data.updatedAt;

    responseDto.attributeHelicopter = data.attributes.map((attr, index) => ({
      attributeId: attr.id,
      attribute: plainToInstance(AttributesDto, attr),
      value: data.values ? data.values[index] : null,
    }));

    responseDto.helicopters = plainToInstance(HelicopterDto, data.helicopters);

    return responseDto;
  }
}
