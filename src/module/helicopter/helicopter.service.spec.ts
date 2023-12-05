import { Test, TestingModule } from '@nestjs/testing';
import { HelicopterService } from './helicopter.service';

describe('HelicopterService', () => {
  let service: HelicopterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelicopterService],
    }).compile();

    service = module.get<HelicopterService>(HelicopterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
