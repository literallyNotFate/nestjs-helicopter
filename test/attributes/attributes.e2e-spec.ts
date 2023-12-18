import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { AttributesService } from '../../src/module/attributes/attributes.service';
import { throwError } from 'rxjs';

describe('Attributes (e2e)', () => {
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

    describe('POST /attibutes', () => {
      it(`should create an attribute (${HttpStatus.CREATED})`, async () => {
        const name: string = 'Test attribute';
        const response = await request(app.getHttpServer())
          .post('/attributes')
          .send({ name });

        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(name);

        attribute = response.body;
      });

      it(`should throw BadRequest if name is not a string (${HttpStatus.BAD_REQUEST})`, async () => {
        const name: number = 1;
        const response = await request(app.getHttpServer())
          .post('/attributes')
          .send({ name });

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if name is empty (${HttpStatus.BAD_REQUEST})`, async () => {
        const name: string = '';
        const response = await request(app.getHttpServer())
          .post('/attributes')
          .send({ name });

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const name: string = 'Test Error';
        const service = app.get<AttributesService>(AttributesService);
        jest.spyOn(service, 'create').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .post('/attributes')
          .send({ name });
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /attributes', () => {
      it(`should get all attributes (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get('/attributes');
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);
        jest.spyOn(service, 'findAll').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer()).get('/attributes');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /attributes/:id', () => {
      it(`should get attribute by ID (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get(
          `/attributes/${attribute.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(attribute.id);
      });

      it(`should throw exception if attribute was not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).get(
          `/attributes/${wrongId}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);
        jest.spyOn(service, 'findOne').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).get(
          `/attributes/${attribute.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('PATCH /attributes/:id', () => {
      it(`should update an attribute (${HttpStatus.OK})`, async () => {
        const edit: string = 'Attribute Edit';
        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send({ name: edit });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.name).toBe(edit);
      });

      it(`should throw BadRequest if name is not a string (${HttpStatus.BAD_REQUEST})`, async () => {
        const edit: number = 1;
        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send({ name: edit });

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if name is empty (${HttpStatus.BAD_REQUEST})`, async () => {
        const edit: string = '';
        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send({ name: edit });

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw exception if attribute was not found (${HttpStatus.NOT_FOUND})`, async () => {
        const edit: string = 'Attribute Edit';
        const wrongId: number = 999;

        const response = await request(app.getHttpServer())
          .patch(`/attributes/${wrongId}`)
          .send({ name: edit });

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);
        const edit: string = 'Attribute Edit';

        jest.spyOn(service, 'update').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .get(`/attributes/${attribute.id}`)
          .send({ name: edit });

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('DELETE /attributes:id', () => {
      it(`should delete an attribute (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).delete(
          `/attributes/${attribute.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
      });

      it(`should throw exception if attribute was not found (${HttpStatus.NOT_FOUND})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).delete(
          `/attributes/${wrongId}`,
        );
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);

        jest.spyOn(service, 'remove').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).delete(
          `/attributes/${attribute.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
