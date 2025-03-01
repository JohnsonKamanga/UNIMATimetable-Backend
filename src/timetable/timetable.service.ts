import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Timetable } from './timetable.entity';
import { Repository } from 'typeorm';
import { parseTimetable } from '../utils';
import { CourseService } from '../course/course.service';
import { CourseToTimeTable } from '../coursetotimetable/coursetotimetable.entity';
import axios from 'axios';
import * as request from 'postman-request';
import { promisify } from 'util';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(Timetable)
    private timetableRepository: Repository<Timetable>,
    @InjectRepository(CourseToTimeTable)
    private courseToTimetableRepository: Repository<CourseToTimeTable>,
    private courseServices: CourseService,
  ) {}

  async fetchTimeTable(
    portalCred: {
      username: string;
      password: string;
    },
    callback: (input: string) => Promise<number>,
  ) {
    const { username, password } = portalCred;
    let id: number;
    //login user in first
    const postAsync = promisify(request.post);
    try {
      const res = await postAsync('https://students.unima.ac.mw/login.php', {
        form: {
          username,
          password,
          login: '',
        },
      });
      //get coockies returned and fetch the timetable from the portal
      const response = await axios.get(
        'https://students.unima.ac.mw/pages/timetable',
        {
          headers: {
            Cookie: `${res.rawHeaders[13]} ${res.rawHeaders[15]}`,
          },
        },
      );
      console.log('id fetching...');
      return await callback(response.data);
    } catch (err) {
      console.error(
        'An error occured when fetching ' + username + "'s" + ' timetable: ',
        err,
      );
      return;
    }
  }

  async createTimeTable(
    portalCred: { username: string; password: string },
    timetableName: string,
    userid: number,
    current: boolean,
  ) {
    try{
    const timetableId: number = await this.fetchTimeTable(
      portalCred,
      async (fileString) => {
        if (current) {
          const t = await this.timetableRepository.find({
            where: {
              current: true,
            },
          });

          for (let i = 0; i < t.length; i++) {
            await this.timetableRepository.update(t[i].id, {
              current: false,
            });
          }
        }
        try {
          if (fileString !== '') {
            const timetableDetails = parseTimetable(fileString);
            const timetable = await this.timetableRepository.save({
              name: timetableName,
              academic_year:
                new Date().getFullYear().toString() +
                '/' +
                (new Date().getFullYear() + 1).toString(),
              semester: Number(timetableDetails[0].course.charAt(4)),
              current: current,
              user: { id: userid },
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
            return timetable.id;
          }
        } catch (error) {
          console.error('an error occured during timetable parsing: ', error);
        }
      },
    );

    if (timetableId) {
      const data = await this.timetableRepository.findOne({
        where: {
          id: timetableId,
        },
        relations: {
          course_to_timetables: true,
          user: false,
        },
      });
      return data;
    }}
    catch(err){
      console.error(
        'An error occured when creating ' + portalCred.username + "'s" + ' timetable: ',
        err,
      );
    }
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

    if (data) {
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
          res.monday[Number(courseSchedule.scheduled_time) - 1] =
            courseSchedule;
        }
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

  async getCurrentUserTimetable(userId: number) {
    const data = await this.timetableRepository.findOne({
      where: {
        current: true,
        user: { id: userId },
      },
      relations: {
        course_to_timetables: true,
        user: false,
      },
    });
    if (!data) {
      return null;
    }

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

    console.log('user: ', userId);
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

  async getCurrentUserTimetableFormattedByCourse(userId: number) {
    try {
      let timetable = await this.timetableRepository.findOne({
        where: {
          current: true,
          user: { id: userId },
        },
        relations: {
          course_to_timetables: true,
          user: false,
        },
      });
      if (!timetable) {
        return;
      }

      for (let i = 0; i < timetable.course_to_timetables.length; i++) {
        const course =
          await this.courseServices.findCourseByTimetableRelationship(
            timetable.course_to_timetables[i].id,
          );
        timetable.course_to_timetables[i].course = course;
      }
      let courses: {
        id: number;
        course_code: string;
        year_taken: number;
        semester: number;
        schedule: { venue: string; scheduled_time: string }[];
      }[] = [];
      let courseToIndex = {}; // {"course_code": matching index position in courses }
      for (let i = 0; i < timetable.course_to_timetables.length; i++) {
        if (
          courseToIndex[
            timetable.course_to_timetables[i].course.course_code
          ] === 0 ||
          courseToIndex[timetable.course_to_timetables[i].course.course_code]
        ) {
          courses[
            Number(
              courseToIndex[
                timetable.course_to_timetables[i].course.course_code
              ],
            )
          ].schedule.push({
            venue: timetable.course_to_timetables[i].venue,
            scheduled_time: timetable.course_to_timetables[i].scheduled_time,
          });
        } else {
          courses.push({
            ...timetable.course_to_timetables[i].course,
            schedule: [
              {
                venue: timetable.course_to_timetables[i].venue,
                scheduled_time:
                  timetable.course_to_timetables[i].scheduled_time,
              },
            ],
          });
          courseToIndex[timetable.course_to_timetables[i].course.course_code] =
            courses.length - 1;
        }
      }

      return courses;
    } catch (err) {
      console.error('An error occured while fetching timetable: ', err);
    }
  }
}
