import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributeHelicopterDto } from './create-attribute-helicopter.dto';

export class UpdateAttributeHelicopterDto extends PartialType(
  CreateAttributeHelicopterDto,
) {}
