import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { Helicopter } from '../../helicopter/entities/helicopter.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'engine' })
export class Engine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  year: number;

  @Column()
  model: string;

  @Column()
  hp: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Helicopter, (helicopter) => helicopter.engine)
  helicopters!: Helicopter[];

  @ManyToOne(() => User, (user) => user.engines)
  creator: User;
}
