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
    const { username, password, userid } = credentials;
    return await this.timetableServices.createTimeTable(
      { username, password },
      userid,
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
}
