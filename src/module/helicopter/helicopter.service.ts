import { Injectable } from '@nestjs/common';
import { CreateHelicopterDto } from './dto/create-helicopter.dto';
import { UpdateHelicopterDto } from './dto/update-helicopter.dto';

@Injectable()
export class HelicopterService {
  create(createHelicopterDto: CreateHelicopterDto) {
    return 'This action adds a new helicopter';
  }

  findAll() {
    return `This action returns all helicopter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} helicopter`;
  }

  update(id: number, updateHelicopterDto: UpdateHelicopterDto) {
    return `This action updates a #${id} helicopter`;
  }

  remove(id: number) {
    return `This action removes a #${id} helicopter`;
  }
}
