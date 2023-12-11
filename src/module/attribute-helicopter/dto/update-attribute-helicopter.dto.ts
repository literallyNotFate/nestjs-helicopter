import { PartialType } from '@nestjs/swagger';
import { CreateAttributeHelicopterDto } from './create-attribute-helicopter.dto';

export class UpdateAttributeHelicopterDto extends PartialType(
  CreateAttributeHelicopterDto,
) {}
