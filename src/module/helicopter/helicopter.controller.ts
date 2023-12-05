import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HelicopterService } from './helicopter.service';
import { CreateHelicopterDto } from './dto/create-helicopter.dto';
import { UpdateHelicopterDto } from './dto/update-helicopter.dto';

@Controller('helicopter')
export class HelicopterController {
  constructor(private readonly helicopterService: HelicopterService) {}

  @Post()
  create(@Body() createHelicopterDto: CreateHelicopterDto) {
    return this.helicopterService.create(createHelicopterDto);
  }

  @Get()
  findAll() {
    return this.helicopterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.helicopterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHelicopterDto: UpdateHelicopterDto,
  ) {
    return this.helicopterService.update(+id, updateHelicopterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.helicopterService.remove(+id);
  }
}
