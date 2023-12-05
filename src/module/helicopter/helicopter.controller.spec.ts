import { Test, TestingModule } from '@nestjs/testing';
import { HelicopterController } from './helicopter.controller';
import { HelicopterService } from './helicopter.service';

describe('HelicopterController', () => {
  let controller: HelicopterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelicopterController],
      providers: [HelicopterService],
    }).compile();

    controller = module.get<HelicopterController>(HelicopterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
