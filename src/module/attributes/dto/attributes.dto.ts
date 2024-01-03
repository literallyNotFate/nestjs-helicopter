import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';
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

  @ApiPropertyOptional({ type: () => UserDto })
  @Type(() => UserDto)
  @IsObject()
  @IsOptional()
  @Expose()
  creator?: UserDto;
}
