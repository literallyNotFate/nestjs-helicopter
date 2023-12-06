import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeHelicopterDto {
  @ApiProperty({
    example: 'Value XYZ',
    type: String,
    required: true,
    nullable: false,
  })
  value!: string;

  @ApiProperty({
    example: 1,
    type: Number,
    nullable: false,
    required: true,
  })
  helicopterId!: number;

  @ApiProperty({
    example: 1,
    type: Number,
    nullable: false,
    required: true,
  })
  attributeId: number;
}
