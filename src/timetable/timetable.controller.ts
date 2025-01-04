import {
  Body,
  Controller,
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
  async createRecipe(
    @UploadedFile() file: Express.Multer.File,
    @Body('userid') userid: number,
  ) {
    if (file)
      return await this.timetableServices.createTimeTable(file.buffer, userid);
    else {
      console.error('Unable to create timetable. File: ', file);
    }
  }
}
