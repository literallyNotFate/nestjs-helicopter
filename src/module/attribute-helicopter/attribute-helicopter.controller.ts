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
import {
  UpdateAttributeHelicopterDto,
  CreateAttributeHelicopterDto,
  AttributeHelicopterResponseDto,
} from './dto';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { Observable, from } from 'rxjs';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { AttributeHelicopterCreatorGuard } from '../../common/guards';

@ApiTags('Attribute Helicopter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
    @Req() request,
    @Body() createAttributeHelicopterDto: CreateAttributeHelicopterDto,
  ): Observable<AttributeHelicopterResponseDto> {
    return from(
      this.attributeHelicopterService.create(
        request,
        createAttributeHelicopterDto,
      ),
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

  @ApiOperation({
    summary: 'Endpoint to get all helicopter attributes of a creator',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got all helicopter attributes of a creator',
    type: [AttributeHelicopterResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get helicopter attributes of a creator',
  })
  @Get()
  findAllByCreator(
    @Req() request,
  ): Observable<AttributeHelicopterResponseDto[]> {
    const email: string = request.user.email;
    return from(this.attributeHelicopterService.findAllByCreator(email));
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
  @UseGuards(AttributeHelicopterCreatorGuard)
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
  @UseGuards(AttributeHelicopterCreatorGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Observable<void> {
    return this.attributeHelicopterService.remove(+id);
  }
}
