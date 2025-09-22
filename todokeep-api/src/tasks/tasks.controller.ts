import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }
  // @Get()
  // findAll() {
  //   return this.tasksService.findAll();
  // }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; complete?: boolean },
  ) {
    return this.tasksService.update(id, body);
  }
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
