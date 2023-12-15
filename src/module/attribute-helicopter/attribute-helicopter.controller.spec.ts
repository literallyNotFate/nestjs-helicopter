import { AttributeHelicopterResponseDto } from './dto/attribute-helicopter-response.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AttributeHelicopterController } from './attribute-helicopter.controller';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { of } from 'rxjs';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';

describe('AttributeHelicopterController', () => {
  let controller: AttributeHelicopterController;
  let service: AttributeHelicopterService;

  const mockAttributeHelicopterContoller = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributeHelicopterController],
      providers: [
        {
          provide: AttributeHelicopterService,
          useValue: mockAttributeHelicopterContoller,
        },
      ],
    }).compile();

    controller = module.get<AttributeHelicopterController>(
      AttributeHelicopterController,
    );
    service = module.get<AttributeHelicopterService>(
      AttributeHelicopterService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an attribute helicopter', async () => {
    const createAttributeHelicopterDto: CreateAttributeHelicopterDto = {
      attributeIds: [1, 2],
      values: ['Value 1', 'Value 2'],
    };

    const attributes: Attribute[] = [
      {
        id: createAttributeHelicopterDto.attributeIds[0],
        name: 'Attribute 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
      },
      {
        id: createAttributeHelicopterDto.attributeIds[1],
        name: 'Attribute 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
      },
    ];

    const createdAttributeHelicopter: AttributeHelicopter = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes,
      values: createAttributeHelicopterDto.values,
      helicopters: [],
    };

    const expectedResponse: AttributeHelicopterResponseDto =
      AttributeHelicopterResponseDto.ToResponse(createdAttributeHelicopter);

    jest.spyOn(service, 'create').mockReturnValue(of(expectedResponse));

    const result = await controller
      .create(createAttributeHelicopterDto)
      .toPromise();

    expect(service.create).toHaveBeenCalledWith(createAttributeHelicopterDto);
    expect(result).toBe(expectedResponse);
  });

  it('should return all attribute helicopters', async () => {
    const expectedResponse: AttributeHelicopterResponseDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      helicopters: [],
    };

    const attributeHelicopters = [expectedResponse];

    jest.spyOn(service, 'findAll').mockReturnValue(of(attributeHelicopters));

    const result = await controller.findAll().toPromise();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(attributeHelicopters);
  });

  it('should return attribute helicopter by ID', async () => {
    const attributeHelicopterId: number = 1;

    const expectedResponse: AttributeHelicopterResponseDto = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      helicopters: [],
    };

    jest.spyOn(service, 'findOne').mockReturnValue(of(expectedResponse));

    const result = await controller
      .findOne(attributeHelicopterId.toString())
      .toPromise();

    expect(service.findOne).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
  });

  it('should update attribute helicopter by ID', async () => {
    const attributeHelicopterId: number = 1;

    const updateHelicopterAttriuteDto: UpdateAttributeHelicopterDto = {
      attributeIds: [1, 3],
      values: ['Edit 1', 'Edit 3'],
    };

    const attributes: Attribute[] = [
      {
        id: updateHelicopterAttriuteDto.attributeIds[0],
        name: 'Attribute 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
      },
      {
        id: updateHelicopterAttriuteDto.attributeIds[1],
        name: 'Attribute 3',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
      },
    ];

    const found: AttributeHelicopter = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      values: [],
      helicopters: [],
    };

    const updatedAttributeHelicopter: AttributeHelicopter = {
      id: attributeHelicopterId,
      createdAt: found.createdAt,
      updatedAt: new Date(),
      values: updateHelicopterAttriuteDto.values,
      attributes,
      helicopters: [],
    };

    const expected = AttributeHelicopterResponseDto.ToResponse(
      updatedAttributeHelicopter,
    );

    jest.spyOn(service, 'update').mockReturnValue(of(expected));

    const result = await controller
      .update(attributeHelicopterId.toString(), updateHelicopterAttriuteDto)
      .toPromise();

    expect(service.update).toHaveBeenCalledWith(
      attributeHelicopterId,
      updateHelicopterAttriuteDto,
    );
    expect(result).toEqual(expected);
  });

  it('should remove attribute helicopter by ID', async () => {
    const attributeHelicopterId: number = 1;
    jest.spyOn(service, 'remove').mockReturnValue(of());

    await controller.remove(attributeHelicopterId.toString()).toPromise();

    expect(service.remove).toHaveBeenCalledWith(attributeHelicopterId);
  });
});
