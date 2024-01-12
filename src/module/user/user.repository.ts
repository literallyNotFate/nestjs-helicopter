import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, map } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../../core/auth/dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getByEmail(email: string): Observable<User> {
    return from(this.userRepository.findOneBy({ email }));
  }

  async findOne(id: number): Promise<User> {
    const found = await this.userRepository.findOne({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException(`User with ID:${id} was not found.`);
    }

    return found;
  }

  create(register: RegisterDto): Observable<User> {
    const newUser = this.userRepository.create(register);
    return from(this.userRepository.save(newUser)).pipe(
      map((newUser) => newUser),
    );
  }
}
