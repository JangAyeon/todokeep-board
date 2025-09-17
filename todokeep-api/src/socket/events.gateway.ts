import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`websocket gateway initialized ${client.id}`);
  }

  handleDisconnection(client: Socket) {
    console.log(`websocket disconnected ${client.id}`);
  }
}
