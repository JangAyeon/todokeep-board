import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { BoardsModule } from './boards/boards.module';
import { UploadModule } from './upload/upload.module';
import { SocketModule } from './socket/socket.module';
import { EventsGateway } from './socket/events.gateway';
import { MongooseModule } from '@nestjs/mongoose';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { SocketGateway } from './socket/socket.gateway';
@Module({
  imports: [
    TasksModule,
    BoardsModule,
    UploadModule,
    SocketModule,
    EventsGateway,
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost/todokeep-apiv2'),
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateway],
})
export class AppModule {}
