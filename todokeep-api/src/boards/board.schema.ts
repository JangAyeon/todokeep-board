import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class Board {
  @Prop()
  title: string;
  // Reference to Tasks by ID (one-to-many)
  @Prop({ type: [String] })
  taskIds: string[];

  // Order for drag and drop
  @Prop({ default: 0 })
  order: number;
}

export type BoardDocument = Board & Document;
export const BoardSchema = SchemaFactory.createForClass(Board);
