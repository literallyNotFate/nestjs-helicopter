import { Test, TestingModule } from '@nestjs/testing';
import { AttributeHelicopterService } from './attribute-helicopter.service';

describe('AttributeHelicopterService', () => {
  let service: AttributeHelicopterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttributeHelicopterService],
    }).compile();

    service = module.get<AttributeHelicopterService>(AttributeHelicopterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
