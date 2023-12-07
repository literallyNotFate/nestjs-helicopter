import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAttributeDto {
  @ApiProperty({
    example: 'Attribute XYZ',
    nullable: false,
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
