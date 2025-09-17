import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Task {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  completed: boolean;

  @Prop()
  boardId: string;
}

export type TaskDocument = Task & Document;
export const TaskSchema = SchemaFactory.createForClass(Task);
