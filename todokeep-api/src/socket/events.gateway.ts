import {
    ConnectedSocket,
MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()

  server: Server;
 // Optional: Lifecycle hook - after gateway is initialized
  afterInit(server: any) {
    console.log('WebSocket gateway initialized');
  }

  // Optional: Lifecycle hook - when a client connects
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Optional: Lifecycle hook - when a client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

   // Example handler for joining board room
  @SubscribeMessage('join-board')
  handleJoinBoard(@ConnectedSocket() client: Socket, @MessageBody() boardId: string) {
    client.join(boardId);
    console.log(`Client ${client.id} joined board ${boardId}`);
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

  // Handle task creation in a specific board
  @OnEvent('task.new')
  handleTaskNew(@MessageBody() data: any): void {
    const { boardId, ...task } = data;
    this.server.emit('task:new', task._doc);
  }

  // Handle task update
  @OnEvent('task.update')
  handleTaskUpdate(@MessageBody() data: any): void {
    const { boardId, ...task } = data;
    this.server.emit('task:update', task._doc);
  }

  
  // Handle task deletion
  @OnEvent('task.delete')
  handleTaskDelete(@MessageBody() id: string): void {
    this.server.emit('task:delete', id);
  }
}