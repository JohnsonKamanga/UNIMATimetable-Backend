import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { DeleteResult, ILike, Repository, UpdateResult } from 'typeorm';
import { CreateCourseDto } from './create-course.dto';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(Course)
        private courseRepository: Repository<Course>
    ){}

    createCourse(course : CreateCourseDto): Promise<Course>{
        return this.courseRepository.save(course);
    }

    deleteCourse(id: number): Promise<DeleteResult>{
        return this.courseRepository.delete(id);
    }

    updateCourse(course: Course): Promise<UpdateResult>{
        return this.courseRepository.update(course.id, course);
    }

    findCourseByCode(code: string): Promise<Course>{
        return this.courseRepository.findOne({
            where: {
                course_code: ILike(`%${code}%`),
            }
        })
    }
}
