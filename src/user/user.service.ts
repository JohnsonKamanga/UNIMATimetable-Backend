import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { UpdateNormalUserDetailsDto } from './update-normal-user-details.dto';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(user: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(user);
    await this.userRepository.insert(newUser);
    return newUser;
  }

  deleteUser(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }

  //updated user's credentials excluding the pasword
  updateNormalUserDetails(
    user: UpdateNormalUserDetailsDto,
  ): Promise<UpdateResult> {
    return this.userRepository.update(user.id, user);
  }

  //update user's password
  async updateUserPassword(
    userid: number,
    passwords: { original_password: string; new_password: string },
  ): Promise<UpdateResult> {
    const { original_password, new_password } = passwords;
    try {
      //find user
      const user = await this.userRepository.findOne({ where: { id: userid } });

      if (!user) {
        throw new NotFoundException(`User with the given id not found`);
      }

      //compared original password to hashed password
      const res = await compare(original_password, user.password);

      if (!res) {
        throw new UnauthorizedException(
          'Orginal password submitted is incorrect',
        );
      }

      //generate password salt
      const salt = await genSalt(10);

      //use salt to generate hashed password
      const hashedPassword = await hash(new_password, salt);

      return this.userRepository.update(userid, { password: hashedPassword });
    } catch (err) {
      console.error(
        `An error occured when trying to update the password of the user with id ${userid}: `,
        err,
      );
      return err;
    }
  }

  findUserById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async findUserByUsernameWithoutPassword(username: string) {
    const fetchedUser = await this.userRepository.findOneBy({ username });
    if(!fetchedUser){
      throw new NotFoundException(`User account with the user name ${username} could not be found`)
    }
    const { password, ...user } = fetchedUser;

    return user;
  }

  findUserByUsernameWithPassword(username: string) {
    return this.userRepository.findOneBy({ username });
  }
}
