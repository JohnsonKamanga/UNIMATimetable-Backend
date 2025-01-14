import { CourseToTimeTable } from '../coursetotimetable/coursetotimetable.entity';
import { User } from '../user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  @Column({default: false})
  current: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn()
  last_modified: Date;

  @OneToMany(
    () => CourseToTimeTable,
    (courseToTimeCourseToTimeTable: CourseToTimeTable) =>
      courseToTimeCourseToTimeTable.timetable,
  )
  course_to_timetables: CourseToTimeTable[];

  @ManyToOne(() => User, (user: User) => user.timetables)
  user: User;
}
