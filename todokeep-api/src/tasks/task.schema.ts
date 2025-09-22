import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Task {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  completed: boolean;

  // Reference to Board
  @Prop()
  boardId: string; // This links Task -> Board
}

export type TaskDocument = Task & Document;
export const TaskSchema = SchemaFactory.createForClass(Task);