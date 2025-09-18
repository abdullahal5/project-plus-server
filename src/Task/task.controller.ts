import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskStatusDto } from './dto/update-task.dto';
import { Roles } from 'src/Auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import * as client from '@prisma/client';
import type { Response } from 'express';
import { GetUser } from 'src/Auth/decorators/get-user.decorators';
import { sendResponse } from 'src/common/utilities';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('/')
  @Roles(client.UserRole.ADMIN, client.UserRole.MANAGER, client.UserRole.MEMBER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: client.User,
    @Res() res: Response,
  ) {
    const task = await this.taskService.create(createTaskDto);
    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  }

  // @Get()
  // @UseGuards(JwtAuthGuard)
  // async findAllTasks(@Res() res: Response) {
  //   const tasks = await this.taskService.findAll();
  //   return sendResponse(res, {
  //     statusCode: HttpStatus.OK,
  //     success: true,
  //     message: 'Tasks fetched successfully',
  //     data: tasks,
  //   });
  // }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findTaskById(@Param('id') id: string, @Res() res: Response) {
    const task = await this.taskService.findOne(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Task fetched successfully',
      data: task,
    });
  }

  @Patch('/status/:id')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @GetUser() user: client.User,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateStatus(id, dto, user);
  }

  @Patch(':id')
  @Roles(client.UserRole.ADMIN, client.UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Res() res: Response,
  ) {
    const task = await this.taskService.update(id, updateTaskDto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  }

  @Delete(':id')
  @Roles(client.UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteTask(@Param('id') id: string, @Res() res: Response) {
    await this.taskService.delete(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Task deleted successfully',
    });
  }
}
