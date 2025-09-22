import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findOne(id: string) {
    return this.taskModel.findById(id).exec();
  }

  async create(dto: CreateTaskDto) {
    const created = await this.taskModel.create(dto);
    this.eventEmitter.emit('task.new', created);
    return created;
  }

    async update(id: string, data: Partial<{ title: string; completed: boolean }>) {
    const updated = await this.taskModel.findByIdAndUpdate(id, data, { new: true }).exec();
    this.eventEmitter.emit('task.update', updated);
    return updated;
    }


  async delete(id: string) {
    await this.taskModel.findByIdAndDelete(id).exec();
    this.eventEmitter.emit('task.delete', id);
  }
}