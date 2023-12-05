import { PartialType } from '@nestjs/mapped-types';
import { CreateHelicopterDto } from './create-helicopter.dto';

export class UpdateHelicopterDto extends PartialType(CreateHelicopterDto) {}
