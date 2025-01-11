import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Timetable } from './timetable.entity';
import { Repository } from 'typeorm';
import { parseTimetable } from '../utils';
import { CourseService } from '../course/course.service';
import { CourseToTimeTable } from '../coursetotimetable/coursetotimetable.entity';
import axios from 'axios';
import * as request from 'postman-request';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(Timetable)
    private timetableRepository: Repository<Timetable>,
    @InjectRepository(CourseToTimeTable)
    private courseToTimetableRepository: Repository<CourseToTimeTable>,
    private courseServices: CourseService,
  ) {}

  fetchTimeTable(
    portalCred: {
      username: string;
      password: string;
    },
    callback,
  ) {
    //login user in first
    request.post(
      'https://students.unima.ac.mw/login.php',
      {
        form: {
          username: 'bsc-com-09-21',
          password: 'Timmy Turner',
          login: '',
        },
      },
      async (err, res, payload) => {
        //get coockies returned and fetch the timetable from the portal
        const fileString = (
          await axios.get('https://students.unima.ac.mw/pages/timetable', {
            headers: {
              Cookie: `${res.rawHeaders[13]} ${res.rawHeaders[15]}`,
            },
          })
        ).data;

        if (err) {
          console.error('an error occured when fetching the timetable: ', err);
          return;
        }

        callback(fileString);
      },
    );
  }

  async createTimeTable(
    portalCred: { username: string; password: string },
    userid: number,
  ) {
    let timetableId: number;
    this.fetchTimeTable(portalCred, async (fileString) => {
      if (fileString !== '') {
        const timetableDetails = parseTimetable(fileString);
        const timetable = await this.timetableRepository.save({
          name: Date.now().toString(),
          academic_year:
            new Date().getFullYear().toString() +
            '/' +
            (new Date().getFullYear() + 1).toString(),
          semester: Number(timetableDetails[0].course.charAt(4)),
          user: { id: userid },
        });

        timetableId = timetable.id;

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
      }
    });

    if (timetableId) {
      return this.timetableRepository.findOne({
        where: {
          id: timetableId,
        },
        relations: {
          course_to_timetables: true,
          user: false,
        },
      });
    }
    return;
  }

  async getTimeTable(userid: number, name: string) {
    const data = await this.timetableRepository.findOne({
      where: {
        name: name,
        user: { id: userid },
      },
      relations: {
        course_to_timetables: true,
        user: false,
      },
    });

    let res: {
      monday: CourseToTimeTable[];
      tuesday: CourseToTimeTable[];
      wednesday: CourseToTimeTable[];
      thursday: CourseToTimeTable[];
      friday: CourseToTimeTable[];
    } = {
      monday: [null, null, null, null, null, null, null, null, null],
      tuesday: [null, null, null, null, null, null, null, null, null],
      wednesday: [null, null, null, null, null, null, null, null, null],
      thursday: [null, null, null, null, null, null, null, null, null],
      friday: [null, null, null, null, null, null, null, null, null],
    };

    for (let i = 0; i < data.course_to_timetables.length; i++) {
      const courseSchedule = await this.courseToTimetableRepository.findOne({
        where: {
          id: data.course_to_timetables[i].id,
        },
        relations: {
          course: true,
          timetable: false,
        },
      });

      if (Number(courseSchedule.scheduled_time) >= 40) {
        res.friday[Number(courseSchedule.scheduled_time) - 40 - 1] =
          courseSchedule;
      } else if (Number(courseSchedule.scheduled_time) >= 30) {
        res.thursday[Number(courseSchedule.scheduled_time) - 30 - 1] =
          courseSchedule;
      } else if (Number(courseSchedule.scheduled_time) >= 20) {
        res.wednesday[Number(courseSchedule.scheduled_time) - 20 - 1] =
          courseSchedule;
      } else if (Number(courseSchedule.scheduled_time) >= 10) {
        res.tuesday[Number(courseSchedule.scheduled_time) - 10 - 1] =
          courseSchedule;
      } else {
        res.monday[Number(courseSchedule.scheduled_time) - 1] = courseSchedule;
      }
    }

    return res;
  }

  getUserTimetables(userId: number): Promise<Timetable[]> {
    return this.timetableRepository.find({
      where: {
        user: { id: userId },
      },
    });
  }
}
