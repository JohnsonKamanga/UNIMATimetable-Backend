import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './create-course.dto';
import { Course } from './course.entity';

@Controller('course')
export class CourseController {
  constructor(private courseServices: CourseService) {}

  @Get()
  findCourseByCode(@Body() code: string) {
    return this.courseServices.findCourseByCode(code);
  }

  @Post()
  createCourse(@Body() course: CreateCourseDto) {
    return this.courseServices.createCourse(course);
  }

  @Put()
  updateCourse(@Body() course: Course) {
    return this.courseServices.updateCourse(course);
  }

  @Delete()
  deleteCourse(@Body() id: number) {
    return this.courseServices.deleteCourse(id);
  }
}
