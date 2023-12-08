import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsPositive } from 'class-validator';

export class CreateAttributeHelicopterDto {
  @ApiProperty({
    example: 'Value XYZ',
    type: String,
    required: true,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  value!: string;

  // @ApiPropertyOptional({
  //   example: 1,
  //   type: Number,
  //   nullable: true,
  // })
  // @IsOptional()
  // @IsInt()
  // @IsPositive()
  // @IsNotEmpty()
  // helicopterId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
    nullable: false,
    required: true,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  attributeId: number;
}
