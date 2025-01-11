import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timetable } from './timetable.entity';
import { CourseModule } from '../course/course.module';
import { CourseToTimeTable } from '../coursetotimetable/coursetotimetable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Timetable, CourseToTimeTable]), CourseModule],
  providers: [TimetableService],
  controllers: [TimetableController]
})
export class TimetableModule {}
