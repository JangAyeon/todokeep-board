import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { BoardsModule } from './boards/boards.module';
import { UploadModule } from './upload/upload.module';
import { SocketModule } from './socket/socket.module';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [TasksModule, BoardsModule, UploadModule, SocketModule],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
