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
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';
import { AttributeHelicopterResponseDto } from './dto/attribute-helicopter.dto';
import { Observable, from } from 'rxjs';

@ApiTags('Attribute Helicopter')
@Controller('attribute-helicopter')
export class AttributeHelicopterController {
  constructor(
    private readonly attributeHelicopterService: AttributeHelicopterService,
  ) {}

  @ApiOperation({ summary: 'Endpoint to create helicopter attribute' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Helicopter Attribute was created',
    type: AttributeHelicopterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create helicopter attribute',
  })
  @Post()
  create(
    @Body() createAttributeHelicopterDto: CreateAttributeHelicopterDto,
  ): Observable<AttributeHelicopterResponseDto> {
    return from(
      this.attributeHelicopterService.create(createAttributeHelicopterDto),
    );
  }

  @ApiOperation({ summary: 'Endpoint to get all helicopter attributes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got all helicopter attributes',
    type: [AttributeHelicopterResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get helicopter attributes',
  })
  @Get()
  findAll(): Observable<AttributeHelicopterResponseDto[]> {
    return from(this.attributeHelicopterService.findAll());
  }

  @ApiOperation({ summary: 'Endpoint to get helicopter attribute by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got helicopter attribute by ID',
    type: AttributeHelicopterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get helicopter attribute by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Observable<AttributeHelicopterResponseDto> {
    return from(this.attributeHelicopterService.findOne(+id));
  }

  @ApiOperation({ summary: 'Endpoint to edit helicopter attribute by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Helicopter attribute was edited',
    type: AttributeHelicopterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to edit helicopter attribute',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttributeHelicopterDto: UpdateAttributeHelicopterDto,
  ): Observable<AttributeHelicopterResponseDto> {
    return from(
      this.attributeHelicopterService.update(+id, updateAttributeHelicopterDto),
    );
  }

  @ApiOperation({ summary: 'Endpoint to delete helicopter attribute by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Helicopter attribute was deleted',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete helicopter attribute',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributeHelicopterService.remove(+id);
  }
}
