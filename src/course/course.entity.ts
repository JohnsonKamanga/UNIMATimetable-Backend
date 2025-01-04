import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Course{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    course_code: string;

    @Column()
    year_taken: number;

    @Column()
    semester: number;
}