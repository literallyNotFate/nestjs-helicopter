import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributesDto } from '../../attributes/dto/attributes.dto';
import { HelicopterDto } from '../../helicopter/dto/helicopter.dto';
import { AttributeHelicopter } from '../entities/attribute-helicopter.entity';
import { Type, plainToInstance } from 'class-transformer';
import { UserDto } from '../../user/dto/user.dto';

export class AttributeHelicopterResponseDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Object })
  attributes: {
    attributeId: number;
    attribute: AttributesDto;
    value: string;
  }[];

  @ApiProperty({ type: [HelicopterDto] })
  helicopters: HelicopterDto[];

  @ApiPropertyOptional({ type: () => UserDto })
  @Type(() => UserDto)
  creator?: UserDto;

  public static ToResponse(
    data: AttributeHelicopter,
  ): AttributeHelicopterResponseDto {
    const responseDto = new AttributeHelicopterResponseDto();
    responseDto.id = data.id;
    responseDto.createdAt = data.createdAt;
    responseDto.updatedAt = data.updatedAt;
    responseDto.creator = plainToInstance(UserDto, data.creator);

    if (data.attributes && Array.isArray(data.attributes)) {
      responseDto.attributes = data.attributes.map((attr, index) => ({
        attributeId: attr.id,
        attribute: plainToInstance(AttributesDto, attr),
        value: data.values ? data.values[index] : null,
      }));
    } else {
      responseDto.attributes = [];
    }

    if (data.helicopters && Array.isArray(data.helicopters)) {
      responseDto.helicopters = plainToInstance(
        HelicopterDto,
        data.helicopters,
      );
    } else {
      responseDto.helicopters = [];
    }

    return responseDto;
  }
}
