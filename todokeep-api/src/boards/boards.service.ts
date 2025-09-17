import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Board, BoardDocument } from './board.schema';
import { Model } from 'mongoose';
import { Task, TaskDocument } from 'src/tasks/task.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBoardDto } from './dto/create-board.dto/create-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Task.name) private taskModel: Model<BoardDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getBoardWithTasks(boardId: string) {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) throw new NotFoundException('Board Not Found');

    const tasks = await this.taskModel.find({ boardId }).exec();
    return { ...board.toObject(), tasks };
  }
  async findAll() {
    return this.boardModel.find().exec();
  }

  async create(dto: CreateBoardDto) {
    const created = await this.boardModel.create(dto);
    this.eventEmitter.emit('board.new', created);
    return created;
  }

  async update(id: string, title: string) {
    const updated = await this.boardModel
      .findByIdAndUpdate(id, { title }, { new: true })
      .exec();
    return updated;
  }

  async delete(id: string) {
    // 1. Delete board
    const updated = await this.boardModel.findByIdAndDelete(id).exec();

    // 2. Delete All taks that matching with boardId
    await this.taskModel.deleteMany({ boardId: id }).exec();

    // 3. Emit Event - optional
    this.eventEmitter.emit('board.delete', id);
  }
}
