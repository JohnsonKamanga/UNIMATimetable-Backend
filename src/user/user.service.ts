import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { UpdateNormalUserDetailsDto } from './update-normal-user-details.dto';

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

    //updated user's credentials excluding the pasword
    updateNormalUserDetails(user : UpdateNormalUserDetailsDto): Promise<UpdateResult>{
        return this.userRepository.update(user.id, user);
    }

    findUserById(id: number): Promise<User>{
        return this.userRepository.findOneBy({id});
    }

    async findUserByUsernameWithoutPassword(username: string){
        const fetchedUser = await this.userRepository.findOneBy({username});
        const {password, ...user} = fetchedUser;

        return user;
    }
}
