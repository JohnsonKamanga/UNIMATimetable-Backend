import { CourseToTimeTable } from 'src/coursetotimetable/coursetotimetable.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  course_code: string;

  @Column()
  year_taken: number;

  @Column()
  semester: number;

  @OneToMany(
    () => CourseToTimeTable,
    (courseToTimeCourseToTimeTable: CourseToTimeTable) =>
      courseToTimeCourseToTimeTable.course,
  )
  course_to_timetables: CourseToTimeTable[];
}
