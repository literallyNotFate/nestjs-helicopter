import { ApiProperty } from '@nestjs/swagger';
import { AttributeHelicopterDto } from 'src/module/attribute-helicopter/dto/attribute-helicopter.dto';

export class AttributesDto {
  @ApiProperty({ example: 1, type: Number, nullable: false })
  id: number;

  @ApiProperty({ example: 'Color', nullable: false, type: String })
  name!: string;

  @ApiProperty({ type: [AttributeHelicopterDto], isArray: true })
  helicopters: AttributeHelicopterDto[];

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-12T13:55:37.839Z', type: Date })
  updatedAt: Date;
}
