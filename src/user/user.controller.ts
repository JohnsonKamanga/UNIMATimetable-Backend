import { Body, Controller, Delete, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';

@Controller('user')
export class UserController {
    constructor(
        private userServices : UserService
    ){}

    @Post()
    createUser(@Body()user: CreateUserDto){
        return this.userServices.createUser(user);
    }

    @Put()
    updateUser(@Body()user: User){
        return this.updateUser(user);
    }

    @Delete()
    deleteUser(@Body()id: number){
        return this.userServices.deleteUser(id);
    }
}
