import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { AttributeHelicopter } from 'src/module/attribute-helicopter/entities/attribute-helicopter.entity';

@Entity({ name: 'attributes' })
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(
    () => AttributeHelicopter,
    (attributeHelicopter) => attributeHelicopter.attribute,
  )
  helicopters: AttributeHelicopter[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
