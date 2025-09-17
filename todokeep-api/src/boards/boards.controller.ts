import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardService: BoardsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.getBoardWithTasks(id);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Post()
  create(@Body() dto: CreateBoardDto) {
    return this.boardService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('title') title: string) {
    return this.boardService.update(id, title);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.boardService.delete(id);
  }
}
