import { Module } from '@nestjs/common';
import { CoursetotimetableService } from './coursetotimetable.service';
import { CoursetotimetableController } from './coursetotimetable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseToTimeTable } from './coursetotimetable.entity';
import { Timetable } from 'src/timetable/timetable.entity';
import { Course } from 'src/course/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseToTimeTable, Timetable, Course])],
  providers: [CoursetotimetableService],
  controllers: [CoursetotimetableController],
  exports: [CoursetotimetableService]
})
export class CoursetotimetableModule {}
