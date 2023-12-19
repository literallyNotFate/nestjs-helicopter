import { Gender } from '../../../common/enums/gender.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { AttributeHelicopterResponseDto } from '../../attribute-helicopter/dto/attribute-helicopter-response.dto';
import { AttributesDto } from '../../attributes/dto/attributes.dto';
import { EngineDto } from '../../engine/dto/engine.dto';
import { HelicopterDto } from '../../helicopter/dto/helicopter.dto';

@Exclude()
export class UserDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @Expose()
  id: number;

  @ApiProperty({
    example: '2023-05-12T13:55:37.839Z',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-12T13:55:37.839Z',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    nullable: false,
    example: 'John',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  firstName!: string;

  @ApiProperty({
    nullable: false,
    example: 'Doe',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  lastName!: string;

  @ApiPropertyOptional({
    nullable: true,
    enum: Gender,
    type: 'enum',
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  @Expose()
  gender?: Gender;

  @ApiProperty({
    nullable: false,
    required: true,
    type: String,
    example: 'johndoe@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email!: string;

  @ApiProperty({
    nullable: false,
    required: true,
    type: String,
    example: 'abc123',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 20, {
    message: 'password length must be in range between 4 and 20',
  })
  @Expose()
  password!: string;

  @ApiProperty({
    nullable: false,
    required: true,
    type: String,
    example: '+37368345678',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('MD')
  @Expose()
  phoneNumber!: string;

  @ApiProperty({ type: [HelicopterDto] })
  helicopters: HelicopterDto[];

  @ApiProperty({ type: [AttributeHelicopterResponseDto] })
  attributeHelicopters: HelicopterDto[];

  @ApiProperty({ type: [AttributesDto] })
  attributes: HelicopterDto[];

  @ApiProperty({ type: [EngineDto] })
  engines: HelicopterDto[];
}
