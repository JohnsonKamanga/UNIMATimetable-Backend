import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ){}

    async createUser(user : CreateUserDto): Promise<User>{
        const newUser = this.userRepository.create(user);
        await this.userRepository.insert(newUser);
        return newUser;
    }

    deleteUser(id: number): Promise<DeleteResult>{
        return this.userRepository.delete(id);
    }

    updateUser(user : User){
        return this.userRepository.update(user.id, user);
    }
}
