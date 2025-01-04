import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { NotFoundError } from 'rxjs';
import { CreateUserDto } from 'src/user/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(private userServices: UserService, private jtwService: JwtService){}

    async signUp(user: CreateUserDto){

        //extract password from user
        const {password, ...otherUserProperties} = user;

        //generate salt
        const salt = await genSalt(10);

        //hash the password
        const hashedPassword = await hash(password, salt);

        //create new user with hashed password
        const newUser = await this.userServices.createUser({password: hashedPassword, ...otherUserProperties});

        //generate access token
        const token = await this.jtwService.signAsync({sub: newUser.id, username: newUser.username});

        return {
            access_token: token
        }
    }

    async signIn(username: string, password: string){

        //find the target user in the database
        const user = await this.userServices.findUserByUsernameWithPassword(username);

        //throw user not found exception if user is not found
        if(!user){
            throw new NotFoundException('User not found');
        }

        //compare entered password with stored hash
        const res = await  compare(password, user.password);

        //if comparison fails, throw unauthorized exception
        if(!res){
            throw new UnauthorizedException('Username or Password is incorrect');
        }

        //generate access token
        const token = await this.jtwService.signAsync({sub: user.id, username: user.username});

        return {
            access_token: token
        }
    }
}
