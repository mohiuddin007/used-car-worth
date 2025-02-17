import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    //see if email already exists
    const users = await this.userService.find(email);
    if (users && Array.isArray(users) && users.length) {
      throw new BadRequestException('Email already exists');
    }

    //hash the users password

    //generate a salt
    const salt = randomBytes(8).toString('hex');

    //hash the salt and the password together
    const hashed = (await scrypt(password, salt, 32)) as Buffer;

    //join the hashed result and the salt together
    const result = salt + '.' + hashed.toString('hex');

    //create a new user and save it
    const user = await this.userService.create(email, result);

    return user;
  }

  async signin(email: string, password: string) {
    // implement signin logic here
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const [salt, storedHash] = user.password.split('.');

    //hash the password with the salt
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Wrong password');
    }
    return user;
  }
}
