import { PickType } from '@nestjs/swagger';
import { EngineDto } from './engine.dto';

export class CreateEngineDto extends PickType(EngineDto, [
  'name',
  'year',
  'model',
  'hp',
] as const) {}
