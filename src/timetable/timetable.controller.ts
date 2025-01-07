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

@Controller('timetable')
export class TimetableController {
  constructor(private timetableServices: TimetableService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('htmlFile', {
      storage: memoryStorage(),
    }),
  )
  async createTimetable(
    @UploadedFile() file: Express.Multer.File,
    @Body('userid') userid: number,
  ) {
    if (file)
      return await this.timetableServices.createTimeTable(file.buffer, userid);
    else {
      console.error('Unable to create timetable. File: ', file);
    }
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
