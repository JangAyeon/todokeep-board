import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from './board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Task } from 'src/tasks/task.schema';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Task.name) private taskModel: Model<BoardDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getBoardWithTasks(boardId: string) {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) throw new NotFoundException('Board not found');

    const tasks = await this.taskModel
      .find({
        boardId,
      })
      .sort({ order: 1 }) // Sort by order field
      .exec();

    return { ...board.toObject(), tasks };
  }

  async findAll() {
    return this.boardModel.find().sort({ order: 1 }).exec();
  }

  async getAllBoardsWithTasks() {
    const boards = await this.boardModel.find().exec();

    const boardsWithTasks = await Promise.all(
      boards.map(async (board) => {
        const tasks = await this.taskModel
          .find({ boardId: board._id })
          .sort({ order: 1 }) // Sort by order field
          .exec();
        return { ...board.toObject(), tasks };
      }),
    );

    return boardsWithTasks;
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
    this.eventEmitter.emit('board.update', updated);
    return updated;
  }

  async delete(id: string) {
    // 1. Delete the board
    await this.boardModel.findByIdAndDelete(id).exec();

    // 2. Delete all tasks with matching boardId
    await this.taskModel.deleteMany({ boardId: id }).exec();

    // 3. Emit event (optional)
    this.eventEmitter.emit('board.delete', id);
  }

  async reorderTasks(boardId: string, taskIds: string[]) {
    // Update order for each task
    const updatePromises = taskIds.map((taskId, index) =>
      this.taskModel.findByIdAndUpdate(taskId, { order: index }).exec(),
    );

    await Promise.all(updatePromises);

    // Return updated tasks
    return this.taskModel.find({ boardId }).sort({ order: 1 }).exec();
  }

  async reorderBoards(boardIds: string[]) {
    const updatePromises = boardIds.map((boardId, index) =>
      this.boardModel.findByIdAndUpdate(boardId, { order: index }).exec(),
    );

    await Promise.all(updatePromises);

    // Return updated boards

    const updatedBoards = await this.boardModel
      .find()
      .sort({ order: 1 })
      .exec();

    // console.log('Reordered Boards:', updatedBoards);
    this.eventEmitter.emit('board.reorder', updatedBoards);
    return updatedBoards;
  }
}
