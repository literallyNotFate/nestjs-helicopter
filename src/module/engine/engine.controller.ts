import { Observable, from } from 'rxjs';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger/dist';
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
import { EngineService } from './engine.service';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';
import { EngineDto } from './dto/engine.dto';

@ApiTags('Engine')
@Controller('engine')
export class EngineController {
  constructor(private readonly engineService: EngineService) {}

  @ApiOperation({ summary: 'Endpoint to create engine' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Engine was created',
    type: EngineDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create engine',
  })
  @Post()
  create(@Body() createEngineDto: CreateEngineDto) {
    return from(this.engineService.create(createEngineDto));
  }

  @ApiOperation({ summary: 'Endpoint to get all engines' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got all engines',
    type: [EngineDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get engines',
  })
  @Get()
  findAll(): Observable<EngineDto[]> {
    return from(this.engineService.findAll());
  }

  @ApiOperation({ summary: 'Endpoint to get engine by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got engine by ID',
    type: [EngineDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get engine by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Observable<EngineDto> {
    return from(this.engineService.findOne(+id));
  }

  @ApiOperation({ summary: 'Endpoint to edit engine by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Engine was edited',
    type: EngineDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to edit engine',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEngineDto: UpdateEngineDto,
  ): Observable<EngineDto> {
    return from(this.engineService.update(+id, updateEngineDto));
  }

  @ApiOperation({ summary: 'Endpoint to delete engine by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Engine was deleted',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete engine',
  })
  @Delete(':id')
  remove(@Param('id') id: string): Observable<void> {
    return this.engineService.remove(+id);
  }
}
