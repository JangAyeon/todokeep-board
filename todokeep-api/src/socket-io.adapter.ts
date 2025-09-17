import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

export class SocketIoAdapter extends IoAdapter {
  private readonly allowdOrigin = 'http://localhost:4000';
  constructor(app: INestApplicationContext) {
    super(app);
  }

  public createIOServer(port: number, options?: any) {
    const cors = {
      origin: this.allowdOrigin,
      method: ['GET', 'POST'],
      credentials: true,
    };
    const optionsWithCORS = {
      ...options,
      cors: cors,
    };
    return super.createIOServer(port, optionsWithCORS);
  }
}
