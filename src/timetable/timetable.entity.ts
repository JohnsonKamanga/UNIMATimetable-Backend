import { CourseToTimeTable } from 'src/coursetotimetable/coursetotimetable.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Timetable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  academic_year: string;

  @Column()
  semester: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn()
  last_modified: Date;

  @OneToMany(()=>CourseToTimeTable, (courseToTimeCourseToTimeTable: CourseToTimeTable)=> courseToTimeCourseToTimeTable.timetable)
  course_to_timetable: CourseToTimeTable;
}
