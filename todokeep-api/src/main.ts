import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.enableCors(/*{
    origin: true,
    credentials: true,
    exposedHeaders: ['Authorization'], // * 사용할 헤더 추가.
  }*/);
  const PORT = process.env.PORT || 3000;
  // console.log('###', PORT, process.env.PORT, process.env.MONGODB_URI);
  await app.listen(PORT, '0.0.0.0');
}
bootstrap();
