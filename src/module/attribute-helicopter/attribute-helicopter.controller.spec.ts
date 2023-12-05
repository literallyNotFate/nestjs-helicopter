import { Test, TestingModule } from '@nestjs/testing';
import { AttributeHelicopterController } from './attribute-helicopter.controller';
import { AttributeHelicopterService } from './attribute-helicopter.service';

describe('AttributeHelicopterController', () => {
  let controller: AttributeHelicopterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributeHelicopterController],
      providers: [AttributeHelicopterService],
    }).compile();

    controller = module.get<AttributeHelicopterController>(AttributeHelicopterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
