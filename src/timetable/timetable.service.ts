import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Timetable } from './timetable.entity';
import { Repository } from 'typeorm';
import { parseTimetableFile } from 'src/utils';
import { CourseService } from 'src/course/course.service';
import { CourseToTimeTable } from 'src/coursetotimetable/coursetotimetable.entity';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(Timetable)
    private timetableRepository: Repository<Timetable>,
    @InjectRepository(CourseToTimeTable)
    private courseToTimetableRepository: Repository<CourseToTimeTable>,
    private courseServices: CourseService,
  ) {}

  async createTimeTable(fileBuffer: Buffer, userid) {
    const timetableDetails = parseTimetableFile(fileBuffer);
    const timetable = await this.timetableRepository.save({
      name: Date.now().toString(),
      academic_year:
        new Date().getFullYear().toString() +
        '/' +
        (new Date().getFullYear() + 1).toString(),
      semester: Number(timetableDetails[0].course.charAt(4)),
      user: userid
    });

    for (let i = 0; i < timetableDetails.length; i++) {
      const course = await this.courseServices.createCourse({
        course_code: timetableDetails[i].course,
        year_taken: Number(timetableDetails[i].course.charAt(3)),
        semester: Number(timetableDetails[i].course.charAt(4)),
      });

      for (let j = 0; j < timetableDetails[i].schedule.length; j++) {
        await this.courseToTimetableRepository.save({
          venue: timetableDetails[i].schedule[j].venue,
          scheduled_time: timetableDetails[i].schedule[j].time,
          timetable: timetable,
          course: course,
        });
      }
    }
    return this.timetableRepository.findOne({
      where: {
        id: timetable.id,
      },
      relations: {
        course_to_timetables: true,
        user: false,
      },
    });
  }
}
