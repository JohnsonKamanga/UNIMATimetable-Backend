import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTimeTableDto } from './create-timetable.dto';

@Controller('timetable')
export class TimetableController {
  constructor(private timetableServices: TimetableService) {}

  @Post()
  async createTimetable(@Body() credentials: CreateTimeTableDto) {
    const { username, password, timetableName, current , userid } = credentials;
    return await this.timetableServices.createTimeTable(
      { username, password },
      timetableName,
      userid,
      current
    );
  }

  @Get('view')
  async getTimeTable(
    @Query('userId') userId?: number,
    @Query('name') name?: string,
  ) {
    return this.timetableServices.getTimeTable(userId, name);
  }

  @Get(':userId')
  getUserTimeTables(@Param('userId') userId: number) {
    return this.timetableServices.getUserTimetables(userId);
  }

  @Get('view/current')
  async getCurrentUserTimeTable(
    @Query('userId') userId?: number,
  ) {
    return this.timetableServices.getCurrentUserTimetable(userId);
  }

  @Get('view/current/courses')
  async getCurrentUserTimeTableFormattedByCourse(
    @Query('userId') userId?: number,
  ) {
    return this.timetableServices.getCurrentUserTimetableFormattedByCourse(userId);
  }

}
