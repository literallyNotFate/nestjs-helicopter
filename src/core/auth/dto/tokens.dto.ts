import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokensDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
