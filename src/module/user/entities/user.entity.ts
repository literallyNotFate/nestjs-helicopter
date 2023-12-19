import { AttributeHelicopter } from '../../attribute-helicopter/entities/attribute-helicopter.entity';
import { Gender } from '../../../common/enums/gender.enum';
import { Exclude } from 'class-transformer';
import { Attribute } from '../../attributes/entities/attribute.entity';
import { Helicopter } from '../../helicopter/entities/helicopter.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Engine } from '../../engine/entities/engine.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ nullable: false })
  firstName!: string;

  @Column({ nullable: false })
  lastName!: string;

  @Column({ nullable: true, enum: Gender, type: 'enum' })
  gender?: Gender;

  @Column({ nullable: false })
  email!: string;

  @Column({ nullable: false })
  @Exclude()
  password!: string;

  @Column({ nullable: false, name: 'phone_number' })
  phoneNumber!: string;

  @OneToMany(() => Helicopter, (helicopter) => helicopter.creator)
  helicopters: Helicopter[];

  @OneToMany(() => Attribute, (attributes) => attributes.creator)
  attributes: Attribute[];

  @OneToMany(
    () => AttributeHelicopter,
    (attributeHelicopter) => attributeHelicopter.creator,
  )
  attributeHelicopters: AttributeHelicopter[];

  @OneToMany(() => Engine, (engine) => engine.creator)
  engines: Engine[];
}
