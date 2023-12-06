import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger/dist';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { HelicopterDto } from '../helicopter/dto/helicopter.dto';

@ApiTags('Attributes')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @ApiOperation({ summary: 'Endpoint to create attribute' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute was created',
    type: HelicopterDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create attribute',
  })
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  @ApiOperation({ summary: 'Endpoint to get all attributes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got all attributes',
    type: [HelicopterDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get attributes',
  })
  @Get()
  findAll() {
    return this.attributesService.findAll();
  }

  @ApiOperation({ summary: 'Endpoint to get attribute by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got attribute by ID',
    type: [HelicopterDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get attribute by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Endpoint to edit attribute by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute was edited',
    type: HelicopterDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to edit attribute',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributesService.update(+id, updateAttributeDto);
  }

  @ApiOperation({ summary: 'Endpoint to delete attribute by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute was deleted',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete attribute',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributesService.remove(+id);
  }
}
