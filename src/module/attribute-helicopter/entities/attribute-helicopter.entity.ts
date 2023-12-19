import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { Attribute } from '../../attributes/entities/attribute.entity';
import { Helicopter } from '../../helicopter/entities/helicopter.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'attribute-helicopter' })
export class AttributeHelicopter {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'text', array: true, nullable: true })
  values: string[];

  @ManyToMany(() => Attribute)
  @JoinTable({
    name: 'attribute_helicopter_attributes',
    joinColumn: { name: 'attribute_helicopter_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attribute_id', referencedColumnName: 'id' },
  })
  attributes: Attribute[];

  @OneToMany(() => Helicopter, (helicopter) => helicopter.attributeHelicopter)
  helicopters: Helicopter[];

  @ManyToOne(() => User, (user) => user.attributeHelicopters)
  creator: User;
}
