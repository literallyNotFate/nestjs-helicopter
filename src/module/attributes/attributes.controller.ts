import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger/dist';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AttributesDto, CreateAttributeDto, UpdateAttributeDto } from './dto';
import { AttributesService } from './attributes.service';
import { Observable, from } from 'rxjs';
import { AttributeCreatorGuard } from '../../common/guards/index';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';

@ApiTags('Attributes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @ApiOperation({ summary: 'Endpoint to create attribute' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute was created',
    type: AttributesDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create attribute',
  })
  create(
    @Req() request,
    @Body() createAttributeDto: CreateAttributeDto,
  ): Observable<AttributesDto> {
    return from(this.attributesService.create(request, createAttributeDto));
  }

  @ApiOperation({ summary: 'Endpoint to get all attributes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got all attributes',
    type: [AttributesDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get attributes',
  })
  @Get()
  findAll(): Observable<AttributesDto[]> {
    return from(this.attributesService.findAll());
  }

  @ApiOperation({ summary: 'Endpoint to get attribute by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got attribute by ID',
    type: AttributesDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get attribute by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Observable<AttributesDto> {
    return from(this.attributesService.findOne(+id));
  }

  @ApiOperation({ summary: 'Endpoint to edit attribute by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute was edited',
    type: AttributesDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to edit attribute',
  })
  @Patch(':id')
  @UseGuards(AttributeCreatorGuard)
  update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ): Observable<AttributesDto> {
    return from(this.attributesService.update(+id, updateAttributeDto));
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
  @UseGuards(AttributeCreatorGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Observable<void> {
    return this.attributesService.remove(+id);
  }
}
