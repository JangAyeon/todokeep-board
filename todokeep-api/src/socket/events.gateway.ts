import { OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
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
  // Handle client-side message: socket.emit('board.new', data)
  @OnEvent('board.new')
  handleBoardNew(@MessageBody() data: any): void {
    this.server.emit('board:new', data);
  }
  // Handle client-side update request: socket.emit('board.update', data)
  @OnEvent('board.update')
  handleBoardUpdate(@MessageBody() data: any): void {
    this.server.emit('board:update', data);
  }

  // Handle board delete
  @OnEvent('board.delete')
  handleBoardDelete(@MessageBody() id: string): void {
    this.server.emit('board:delete', id);
  }
}
