import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './boards/boards.module';
import { TasksModule } from './tasks/tasks.module';
import { SocketGateway } from './socket/socket.gateway';
import { UploadModule } from './upload/upload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsGateway } from './socket/events.gateway';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/todokeep-apiv2'),
    BoardsModule,
    TasksModule,
    UploadModule,
    EventsGateway,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateway],
})
export class AppModule {}
