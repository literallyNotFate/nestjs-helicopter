import { Injectable } from '@nestjs/common';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';

@Injectable()
export class AttributeHelicopterService {
  create(createAttributeHelicopterDto: CreateAttributeHelicopterDto) {
    return 'This action adds a new attributeHelicopter';
  }

  findAll() {
    return `This action returns all attributeHelicopter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attributeHelicopter`;
  }

  update(id: number, updateAttributeHelicopterDto: UpdateAttributeHelicopterDto) {
    return `This action updates a #${id} attributeHelicopter`;
  }

  remove(id: number) {
    return `This action removes a #${id} attributeHelicopter`;
  }
}
