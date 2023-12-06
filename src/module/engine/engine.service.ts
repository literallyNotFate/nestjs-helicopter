import { Injectable } from '@nestjs/common';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';
import { EngineDto } from './dto/engine.dto';

@Injectable()
export class EngineService {
  create(createEngineDto: CreateEngineDto) {
    return 'This action adds a new engine';
  }

  findAll(): EngineDto {
    return {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'asd',
      name: 'asd',
      year: 123,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} engine`;
  }

  update(id: number, updateEngineDto: UpdateEngineDto) {
    return `This action updates a #${id} engine`;
  }

  remove(id: number) {
    return `This action removes a #${id} engine`;
  }
}
