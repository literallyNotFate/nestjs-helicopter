import { Test, TestingModule } from '@nestjs/testing';
import { HelicopterController } from './helicopter.controller';
import { HelicopterService } from './helicopter.service';
import { CreateHelicopterDto } from './dto/create-helicopter.dto';
import { HelicopterDto } from './dto/helicopter.dto';
import { of } from 'rxjs';
import { UpdateHelicopterDto } from './dto/update-helicopter.dto';

describe('HelicopterController', () => {
  let controller: HelicopterController;
  let service: HelicopterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelicopterController],
      providers: [
        {
          provide: HelicopterService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HelicopterController>(HelicopterController);
    service = module.get<HelicopterService>(HelicopterService);
  });

  it('should create a helicopter', async () => {
    const createHelicopterDto: CreateHelicopterDto = {
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      attributeHelicopterId: 1,
    };

    const createdHelicopter: HelicopterDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine XYZ',
        year: 2023,
        model: 'Model ABC',
        hp: 300,
        helicopters: [],
      },
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    jest.spyOn(service, 'create').mockReturnValue(of(createdHelicopter));

    const result = await controller.create(createHelicopterDto).toPromise();

    expect(service.create).toHaveBeenCalledWith(createHelicopterDto);
    expect(result).toBe(createdHelicopter);
  });

  it('should return all helicopters', async () => {
    const helicopter: HelicopterDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine XYZ',
        year: 2023,
        model: 'Model ABC',
        hp: 300,
        helicopters: [],
      },
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    const helicopters: HelicopterDto[] = [helicopter];

    jest.spyOn(service, 'findAll').mockReturnValue(of(helicopters));

    const result = await controller.findAll().toPromise();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(helicopters);
  });

  it('should return helicopter by ID', async () => {
    const helicopterId: number = 1;

    const found: HelicopterDto = {
      id: helicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine XYZ',
        year: 2023,
        model: 'Model ABC',
        hp: 300,
        helicopters: [],
      },
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    jest.spyOn(service, 'findOne').mockReturnValue(of(found));

    const result = await controller
      .findOne(helicopterId.toString())
      .toPromise();

    expect(service.findOne).toHaveBeenCalled();
    expect(result).toEqual(found);
  });

  it('should update helicopter by ID', async () => {
    const helicopterId: number = 1;

    const engineId: number = 2;
    const attributeHelicopterId: number = 2;

    const updateHelicopterDto: UpdateHelicopterDto = {
      model: 'edit',
      year: 2020,
      engineId,
      attributeHelicopterId,
    };

    const foundHelicopter: HelicopterDto = {
      id: helicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine',
        year: 2023,
        model: 'Model',
        hp: 300,
        helicopters: [],
      },
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    const updatedHelicopter: HelicopterDto = {
      id: foundHelicopter.id,
      createdAt: foundHelicopter.createdAt,
      updatedAt: new Date(),
      model: updateHelicopterDto.model,
      year: updateHelicopterDto.year,
      engineId: updateHelicopterDto.engineId,
      engine: {
        id: engineId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine 2',
        year: 2020,
        model: 'Model 2',
        hp: 500,
        helicopters: [],
      },
      attributeHelicopterId: updateHelicopterDto.attributeHelicopterId,
      attributeHelicopter: {
        id: updateHelicopterDto.attributeHelicopterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    jest.spyOn(service, 'update').mockReturnValue(of(updatedHelicopter));

    const result = await controller
      .update(engineId.toString(), updateHelicopterDto)
      .toPromise();

    expect(service.update).toHaveBeenCalledWith(engineId, updateHelicopterDto);
    expect(result).toEqual(updatedHelicopter);
  });

  it('should remove helicopter by ID', async () => {
    const helicopterId: number = 1;
    jest.spyOn(service, 'remove').mockReturnValue(of());

    await controller.remove(helicopterId.toString()).toPromise();

    expect(service.remove).toHaveBeenCalledWith(helicopterId);
  });
});
