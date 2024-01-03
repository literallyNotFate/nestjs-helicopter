import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ForbiddenExceptionFilter } from './common/filters/forbidden-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Helicopters')
    .setDescription('Helicopters API showcase')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', name: 'AccessToken' })
    .build();

  app.useGlobalFilters(new ForbiddenExceptionFilter());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
