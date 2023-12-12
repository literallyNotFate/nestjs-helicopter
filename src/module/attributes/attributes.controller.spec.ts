import { Test, TestingModule } from '@nestjs/testing';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { AttributesDto } from './dto/attributes.dto';
import { of } from 'rxjs';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

describe('AttributesController', () => {
  let controller: AttributesController;
  let service: AttributesService;

  const mockAttributeController = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributesController],
      providers: [
        {
          provide: AttributesService,
          useValue: mockAttributeController,
        },
      ],
    }).compile();

    controller = module.get<AttributesController>(AttributesController);
    service = module.get<AttributesService>(AttributesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an attribute', async () => {
    const createAttributeDto: CreateAttributeDto = {
      name: 'Color',
    };

    const createdAttribute: AttributesDto = {
      id: 1,
      name: 'Color',
      helicopters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(service, 'create').mockReturnValue(of(createdAttribute));

    const result = await controller.create(createAttributeDto).toPromise();

    expect(service.create).toHaveBeenCalledWith(createAttributeDto);
    expect(result).toBe(createdAttribute);
  });

  it('should return all attributes', async () => {
    const attribute: AttributesDto = {
      id: 1,
      name: 'Color',
      helicopters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const attributes: AttributesDto[] = [attribute];

    jest.spyOn(service, 'findAll').mockReturnValue(of(attributes));

    const result = await controller.findAll().toPromise();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(attributes);
  });

  it('should return attribute by ID', async () => {
    const attributeId: number = 1;

    const attribute: AttributesDto = {
      id: attributeId,
      name: 'Color',
      helicopters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(service, 'findOne').mockReturnValue(of(attribute));

    const result = await controller.findOne(attributeId.toString()).toPromise();

    expect(service.findOne).toHaveBeenCalled();
    expect(result).toEqual(attribute);
  });

  it('should update attribute by ID', async () => {
    const attributeId: number = 1;
    const updateAttributeDto: UpdateAttributeDto = {
      name: 'edit',
    };

    const updatedAttribute: AttributesDto = {
      id: attributeId,
      name: updateAttributeDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
    };

    jest.spyOn(service, 'update').mockReturnValue(of(updatedAttribute));

    const result = await controller
      .update(attributeId.toString(), updateAttributeDto)
      .toPromise();

    expect(service.update).toHaveBeenCalledWith(
      attributeId,
      updateAttributeDto,
    );
    expect(result).toEqual(updatedAttribute);
  });

  it('should remove attribute by ID', async () => {
    const attributeId = 1;
    jest.spyOn(service, 'remove').mockReturnValue(of());

    await controller.remove(attributeId.toString()).toPromise();

    expect(service.remove).toHaveBeenCalledWith(attributeId);
  });
});
