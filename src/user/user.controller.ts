import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';

@Controller('user')
export class UserController {
    constructor(
        private userServices : UserService
    ){}

    @Put()
    updateUser(@Body()user: User){
        return this.userServices.updateNormalUserDetails(user);
    }

    @Delete()
    deleteUser(@Body()id: number){
        return this.userServices.deleteUser(id);
    }

    @Get(':username')
    findUserByUsername(@Param('username')username: string){
        return this.userServices.findUserByUsernameWithoutPassword(username);
    }
}
