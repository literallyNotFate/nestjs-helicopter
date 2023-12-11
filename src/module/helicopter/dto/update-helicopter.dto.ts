import { PartialType } from '@nestjs/swagger';
import { CreateHelicopterDto } from './create-helicopter.dto';

export class UpdateHelicopterDto extends PartialType(CreateHelicopterDto) {}
