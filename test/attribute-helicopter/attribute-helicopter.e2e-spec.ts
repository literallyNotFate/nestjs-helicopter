import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { throwError } from 'rxjs';
import { AttributeHelicopterService } from '../../src/module/attribute-helicopter/attribute-helicopter.service';

describe('Attribute Helicopter (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  //   it('should be defined', () => {
  //     expect(app).toBeDefined();
  //   });

  afterAll(async () => {
    await app.close();
  });

  describe('Endpoints', () => {
    let attribute;
    let attributeHelicopter;
    let newAttribute;

    describe('POST /attribute-helicopter', () => {
      it(`should create an attribute helicopter (${HttpStatus.CREATED})`, async () => {
        const name: string = 'Test attribute';
        const attributeReq = await request(app.getHttpServer())
          .post('/attributes')
          .send({ name });

        expect(attributeReq.statusCode).toBe(HttpStatus.CREATED);
        expect(attributeReq.body.name).toBe(name);
        const attributeHelicopterData = {
          attributeIds: [attributeReq.body.id],
          values: ['Test value'],
        };

        const response = await request(app.getHttpServer())
          .post('/attribute-helicopter')
          .send(attributeHelicopterData);

        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('id');
        expect(response.body.attributes[0].value).toBe(
          attributeHelicopterData.values[0],
        );
        expect(response.body.attributes[0].attribute.name).toBe(
          attributeReq.body.name,
        );

        attributeHelicopter = response.body;
        attribute = attributeReq.body;
      });

      it(`should throw BadRequest if the ids are invalid (${HttpStatus.BAD_REQUEST})`, async () => {
        const attributeHelicopterData = {
          attributeIds: [attribute.id, 999],
          values: ['Test value 1', 'Test value 2'],
        };

        const response = await request(app.getHttpServer())
          .post('/attribute-helicopter')
          .send(attributeHelicopterData);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if the values array and ids array dont have the same length (${HttpStatus.BAD_REQUEST})`, async () => {
        const attributeHelicopterData = {
          attributeIds: [attribute.id],
          values: ['Test value 1', 'Test value 2'],
        };

        const response = await request(app.getHttpServer())
          .post('/attribute-helicopter')
          .send(attributeHelicopterData);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const attributeHelicopterData = {
          attributeIds: [attribute.id],
          values: ['Test value'],
        };

        const service = app.get<AttributeHelicopterService>(
          AttributeHelicopterService,
        );
        jest.spyOn(service, 'create').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .post('/attribute-helicopter')
          .send(attributeHelicopterData);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /attribute-helicopter', () => {
      it(`should get all attribute helicopter (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get(
          '/attribute-helicopter',
        );
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributeHelicopterService>(
          AttributeHelicopterService,
        );
        jest.spyOn(service, 'findAll').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer()).get(
          '/attribute-helicopter',
        );
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /attribute-helicopter/:id', () => {
      it(`should get attribute helicopter by ID (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get(
          `/attribute-helicopter/${attributeHelicopter.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(attributeHelicopter.id);
      });

      it(`should throw exception if attribute helicopter was not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).get(
          `/attribute-helicopter/${wrongId}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributeHelicopterService>(
          AttributeHelicopterService,
        );
        jest.spyOn(service, 'findOne').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).get(
          `/attribute-helicopter/${attributeHelicopter.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('PATCH /attribute-helicopter/:id', () => {
      it(`should update attribute helicopter (${HttpStatus.OK})`, async () => {
        const name: string = 'Test attribute';
        const attributeReq = await request(app.getHttpServer())
          .post('/attributes')
          .send({ name });

        expect(attributeReq.statusCode).toBe(HttpStatus.CREATED);
        expect(attributeReq.body.name).toBe(name);

        const attributeHelicopterData = {
          attributeIds: [attribute.id, attributeReq.body.id],
          values: ['Edit value 1', 'Edit value 2'],
        };

        const response = await request(app.getHttpServer())
          .patch(`/attribute-helicopter/${attributeHelicopter.id}`)
          .send(attributeHelicopterData);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();

        expect(response.body.attributes[0].value).toBe(
          attributeHelicopterData.values[0],
        );
        expect(response.body.attributes[0].attribute.name).toBe(attribute.name);
        expect(response.body.attributes[1].value).toBe(
          attributeHelicopterData.values[1],
        );
        expect(response.body.attributes[1].attribute.name).toBe(
          attributeReq.body.name,
        );

        newAttribute = attributeReq.body;
      });

      it(`should throw BadRequest if the ids are invalid (${HttpStatus.BAD_REQUEST})`, async () => {
        const attributeHelicopterData = {
          attributeIds: [newAttribute.id, 999],
          values: ['Edit value 1', 'Edit value 2'],
        };

        const response = await request(app.getHttpServer())
          .patch(`/attribute-helicopter/${attributeHelicopter.id}`)
          .send(attributeHelicopterData);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if the values array and ids array dont have the same length (${HttpStatus.BAD_REQUEST})`, async () => {
        const attributeHelicopterData = {
          attributeIds: [attribute.id],
          values: ['Edit value 1', 'Edit value 2'],
        };

        const response = await request(app.getHttpServer())
          .patch(`/attribute-helicopter/${attributeHelicopter.id}`)
          .send(attributeHelicopterData);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw exception if attribute helicopter was not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const attributeHelicopterData = {
          attributeIds: [attribute.id, newAttribute.id],
          values: ['Edit value 1', 'Edit value 2'],
        };

        const wrongId: number = 999;

        const response = await request(app.getHttpServer())
          .patch(`/attribute-helicopter/${wrongId}`)
          .send(attributeHelicopterData);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributeHelicopterService>(
          AttributeHelicopterService,
        );
        const attributeHelicopterData = {
          attributeIds: [attribute.id, newAttribute.id],
          values: ['Edit value 1', 'Edit value 2'],
        };

        jest.spyOn(service, 'update').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .patch(`/attribute-helicopter/${attributeHelicopter.id}`)
          .send(attributeHelicopterData);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('DELETE /attribute-helicopter:id', () => {
      it(`should delete attribute helicopter (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).delete(
          `/attribute-helicopter/${attributeHelicopter.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
      });

      it(`should throw exception if attribute helicopter was not found (${HttpStatus.NOT_FOUND})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).delete(
          `/attribute-helicopter/${wrongId}`,
        );
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributeHelicopterService>(
          AttributeHelicopterService,
        );

        jest.spyOn(service, 'remove').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).delete(
          `/attribute-helicopter/${attributeHelicopter.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
