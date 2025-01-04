import { Course } from "src/course/course.entity";
import { Timetable } from "src/timetable/timetable.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CourseToTimeTable{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    venue: string;

    @Column()
    scheduled_time: string;

    @ManyToOne(()=>Timetable, (timetable: Timetable)=>timetable.course_to_timetable)
    timetable: Timetable;

    @ManyToOne(()=>Course, (course: Course)=>course.course_to_timetable)
    course: Course;

}