import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';
import { UpdateNormalUserDetailsDto } from './update-normal-user-details.dto';
import { UpdatePasswordDto } from './update-password.dto';

@Controller('user')
export class UserController {
    constructor(
        private userServices : UserService
    ){}

    @Put('account-info')
    updateUser(@Body()user: UpdateNormalUserDetailsDto){
        return this.userServices.updateNormalUserDetails(user);
    }

    @Put('password')
    updateUserPassword(@Body()passwordDto: UpdatePasswordDto){
        const {id, ...others} = passwordDto;
        return this.userServices.updateUserPassword(id, others);
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
