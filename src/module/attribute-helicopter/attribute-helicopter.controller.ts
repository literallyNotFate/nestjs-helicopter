import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';

@Controller('attribute-helicopter')
export class AttributeHelicopterController {
  constructor(private readonly attributeHelicopterService: AttributeHelicopterService) {}

  @Post()
  create(@Body() createAttributeHelicopterDto: CreateAttributeHelicopterDto) {
    return this.attributeHelicopterService.create(createAttributeHelicopterDto);
  }

  @Get()
  findAll() {
    return this.attributeHelicopterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributeHelicopterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttributeHelicopterDto: UpdateAttributeHelicopterDto) {
    return this.attributeHelicopterService.update(+id, updateAttributeHelicopterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributeHelicopterService.remove(+id);
  }
}
