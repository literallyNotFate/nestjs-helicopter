import { PickType } from '@nestjs/swagger';
import { AttributesDto } from './attributes.dto';

export class CreateAttributeDto extends PickType(AttributesDto, [
  'name',
] as const) {}
