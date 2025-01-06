import {
  Body,
  Controller,
  Get,
  Post,
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

  @Get()
  async getTimeTable(
    @Body('userId')userId: number, @Body('name')name: string
  ){
    return this.timetableServices.getTimeTable(userId, name);
  }
}
