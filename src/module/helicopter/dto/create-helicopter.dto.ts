import { PickType } from '@nestjs/swagger';
import { HelicopterDto } from './helicopter.dto';

export class CreateHelicopterDto extends PickType(HelicopterDto, [
  'year',
  'model',
  'engineId',
  'attributeHelicopterId',
] as const) {}
