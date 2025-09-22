import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*', // 전체 허용
    credentials: true,
  },
})
export class SocketGateway {
  @SubscribeMessage('message')
  handleMessage(/*client: any, payload: any*/): string {
    return 'Hello world!';
  }
}
