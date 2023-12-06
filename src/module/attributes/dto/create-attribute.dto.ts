import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeDto {
  @ApiProperty({
    example: 'Attribute XYZ',
    nullable: false,
    type: String,
    required: true,
  })
  name!: string;
}
