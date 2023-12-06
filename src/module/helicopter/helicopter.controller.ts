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
import { HelicopterService } from './helicopter.service';
import { CreateHelicopterDto } from './dto/create-helicopter.dto';
import { UpdateHelicopterDto } from './dto/update-helicopter.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { HelicopterDto } from './dto/helicopter.dto';

@ApiTags('Helicopter')
@Controller('helicopter')
export class HelicopterController {
  constructor(private readonly helicopterService: HelicopterService) {}

  @ApiOperation({ summary: 'Endpoint to create helicopter' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Helicopter was created',
    type: HelicopterDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create helicopter',
  })
  @Post()
  create(@Body() createHelicopterDto: CreateHelicopterDto) {
    return this.helicopterService.create(createHelicopterDto);
  }

  @ApiOperation({ summary: 'Endpoint to get all helicopters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got all helicopters',
    type: [HelicopterDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get helicopters',
  })
  @Get()
  findAll() {
    return this.helicopterService.findAll();
  }

  @ApiOperation({ summary: 'Endpoint to get helicopter by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got helicopter by ID',
    type: [HelicopterDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get helicopter by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.helicopterService.findOne(+id);
  }

  @ApiOperation({ summary: 'Endpoint to edit helicopter by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Helicopter was edited',
    type: HelicopterDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to edit helicopter',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHelicopterDto: UpdateHelicopterDto,
  ) {
    return this.helicopterService.update(+id, updateHelicopterDto);
  }

  @ApiOperation({ summary: 'Endpoint to delete helicopter by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Helicopter was deleted',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete helicopter',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.helicopterService.remove(+id);
  }
}
