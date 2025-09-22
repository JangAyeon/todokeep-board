import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

export class SocketIoAdapter extends IoAdapter {
  /*private readonly allowedOrigin =
    process.env.NODE_ENV === 'production'
      ? 'https://your-app-name.vercel.app'
      : 'http://localhost:4000';*/
  private readonly allowedOrigin = '*';
  constructor(app: INestApplicationContext) {
    super(app);
  }

  public createIOServer(port: number, options?: any) {
    const cors = {
      origin: this.allowedOrigin,
      method: ['GET', 'POST'],
      credentials: true,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const optionsWithCORS = {
      ...options,
      cors: cors,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return super.createIOServer(port, optionsWithCORS);
  }
}
