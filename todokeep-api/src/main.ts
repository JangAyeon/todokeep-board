import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.enableCors({
    origin: 'http://localhost:4000',
    credential: false,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
