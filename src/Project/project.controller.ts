import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { sendResponse } from 'src/common/utilities';
import { Roles } from 'src/Auth/decorators/roles.decorator';
import * as client from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetUser } from 'src/Auth/decorators/get-user.decorators';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('/')
  @Roles(client.UserRole.ADMIN, client.UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createProject(
    @Body() dto: CreateProjectDto,
    @GetUser() user: client.User,
    @Res() res: Response,
  ) {
    const project = await this.projectService.createProject(dto, user?.id);
    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  }

  // @Get('/')
  // @UseGuards(JwtAuthGuard)
  // async getAllProjects(@Res() res: Response) {
  //   const projects = await this.projectService.getAllProjects();
  //   return sendResponse(res, {
  //     statusCode: HttpStatus.OK,
  //     success: true,
  //     message: 'Projects fetched successfully',
  //     data: projects,
  //   });
  // }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getProjectById(@Param('id') id: string, @Res() res: Response) {
    const project = await this.projectService.getProjectById(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Project fetched successfully',
      data: project,
    });
  }

  @Patch('/:id')
  @Roles(client.UserRole.ADMIN, client.UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Res() res: Response,
  ) {
    const project = await this.projectService.updateProject(id, dto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  }

  @Delete('/:id')
  @Roles(client.UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteProject(@Param('id') id: string, @Res() res: Response) {
    await this.projectService.deleteProject(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Project deleted successfully',
    });
  }
}
