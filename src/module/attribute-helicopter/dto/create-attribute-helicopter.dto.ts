import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAttributeHelicopterDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    required: true,
    nullable: false,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  attributeIds: number[];

  @ApiProperty({
    type: [String],
    example: ['Red', 'Fast', 'Heavy'],
    required: true,
    nullable: false,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  values: string[];
}
