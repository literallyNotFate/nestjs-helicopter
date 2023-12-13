import { Test, TestingModule } from '@nestjs/testing';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';
import { CreateEngineDto } from './dto/create-engine.dto';
import { EngineDto } from './dto/engine.dto';
import { of } from 'rxjs';
import { UpdateEngineDto } from './dto/update-engine.dto';

describe('EngineController', () => {
  let controller: EngineController;
  let service: EngineService;

  const mockEngineController = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngineController],
      providers: [
        {
          provide: EngineService,
          useValue: mockEngineController,
        },
      ],
    }).compile();

    controller = module.get<EngineController>(EngineController);
    service = module.get<EngineService>(EngineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an engine', async () => {
    const createEngineDto: CreateEngineDto = {
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 500,
    };

    const createdEngine: EngineDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 500,
      helicopters: [],
    };

    jest.spyOn(service, 'create').mockReturnValue(of(createdEngine));

    const result = await controller.create(createEngineDto).toPromise();

    expect(service.create).toHaveBeenCalledWith(createEngineDto);
    expect(result).toBe(createdEngine);
  });

  it('should return all engines', async () => {
    const engine: EngineDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 500,
      helicopters: [],
    };

    const engines: EngineDto[] = [engine];

    jest.spyOn(service, 'findAll').mockReturnValue(of(engines));

    const result = await controller.findAll().toPromise();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(engines);
  });

  it('should return engine by ID', async () => {
    const engineId: number = 1;

    const found: EngineDto = {
      id: engineId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 500,
      helicopters: [],
    };

    jest.spyOn(service, 'findOne').mockReturnValue(of(found));

    const result = await controller.findOne(engineId.toString()).toPromise();

    expect(service.findOne).toHaveBeenCalled();
    expect(result).toEqual(found);
  });

  it('should update engine by ID', async () => {
    const engineId: number = 1;

    const updateEngineDto: UpdateEngineDto = {
      name: 'edited',
      year: 2020,
      model: 'edited',
      hp: 500,
    };

    const updatedEngine: EngineDto = {
      id: engineId,
      name: updateEngineDto.name,
      year: updateEngineDto.year,
      model: updateEngineDto.model,
      hp: updateEngineDto.hp,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
    };

    jest.spyOn(service, 'update').mockReturnValue(of(updatedEngine));

    const result = await controller
      .update(engineId.toString(), updateEngineDto)
      .toPromise();

    expect(service.update).toHaveBeenCalledWith(engineId, updateEngineDto);
    expect(result).toEqual(updatedEngine);
  });

  it('should remove engine by ID', async () => {
    const engineId: number = 1;
    jest.spyOn(service, 'remove').mockReturnValue(of());

    await controller.remove(engineId.toString()).toPromise();

    expect(service.remove).toHaveBeenCalledWith(engineId);
  });
});
