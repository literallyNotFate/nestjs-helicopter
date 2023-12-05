import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Helicopter } from 'src/module/helicopter/entities/helicopter.entity';

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

  @Column({ name: 'helicopter_id' })
  helicopterId: number;

  @OneToMany(() => Helicopter, (helicopter) => helicopter.engineId)
  helicopters: Helicopter[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
