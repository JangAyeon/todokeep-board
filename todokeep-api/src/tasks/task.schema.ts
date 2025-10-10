import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Task as ITask } from '@todokeep/shared';
@Schema()
export class Task implements Omit<ITask, '_id'> {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop({ default: false })
  completed: boolean;

  // Reference to Board
  @Prop()
  boardId: string; // This links Task -> Board

  // Order for drag and drop
  @Prop({ default: 0 })
  order: number;
}

export type TaskDocument = Task & Document;
export const TaskSchema = SchemaFactory.createForClass(Task);
