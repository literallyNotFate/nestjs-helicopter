import { Observable, from } from 'rxjs';
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
import { HelicopterService } from './helicopter.service';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HelicopterDto, CreateHelicopterDto, UpdateHelicopterDto } from './dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { HelicopterCreatorGuard } from '../../common/guards';

@ApiTags('Helicopter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
  create(
    @Req() request,
    @Body() createHelicopterDto: CreateHelicopterDto,
  ): Observable<HelicopterDto> {
    return from(this.helicopterService.create(request, createHelicopterDto));
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
  findAll(): Observable<HelicopterDto[]> {
    return from(this.helicopterService.findAll());
  }

  @ApiOperation({ summary: 'Endpoint to get helicopter by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got helicopter by ID',
    type: HelicopterDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get helicopter by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Observable<HelicopterDto> {
    return from(this.helicopterService.findOne(+id));
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
  @UseGuards(HelicopterCreatorGuard)
  update(
    @Param('id') id: string,
    @Body() updateHelicopterDto: UpdateHelicopterDto,
  ): Observable<HelicopterDto> {
    return from(this.helicopterService.update(+id, updateHelicopterDto));
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
  @UseGuards(HelicopterCreatorGuard)
  remove(@Param('id') id: string): Observable<void> {
    return this.helicopterService.remove(+id);
  }
}
