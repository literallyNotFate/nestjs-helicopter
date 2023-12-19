import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
//import { AttributeHelicopterDto } from '../../attribute-helicopter/dto/attribute-helicopter.dto';

@Exclude()
export class AttributesDto {
  @ApiProperty({ example: 1, type: Number, nullable: false })
  @IsInt()
  @IsPositive()
  @Expose()
  id: number;

  @ApiProperty({ example: 'Color', nullable: false, type: String })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name!: string;

  // @ApiProperty({ type: [AttributeHelicopterDto], isArray: true })
  // helicopters: AttributeHelicopterDto[];

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  @IsDate()
  @IsNotEmpty()
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  @IsDate()
  @IsNotEmpty()
  @Expose()
  updatedAt: Date;
}
