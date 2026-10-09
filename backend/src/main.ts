import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads'});

  // Documentación OpenAPI. Se genera a partir de los decoradores de los
  // controllers y DTOs: Swagger UI en /docs, el documento crudo en /docs-json.
  const config = new DocumentBuilder()
    .setTitle('Proyecto Fishy')
    .setDescription(
      'API REST de Fishy: reportes de fraudes y estafas digitales. ' +
        'Todo, salvo /auth/register, /auth/login y /auth/refresh, requiere un ' +
        'access token: obténlo en POST /auth/login y pégalo en el botón Authorize.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000, '0.0.0.0');
  console.log('API en http://localhost:3000 y en ' + lanUrls().join(', '));
}

function lanUrls(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i => i && i.family === 'IPv4' && !i.internal))
    .map((i) => 'http://' + i!.address + ':3000');
}
bootstrap();