import { AttributeHelicopter } from '../../attribute-helicopter/entities/attribute-helicopter.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

@Entity({ name: 'attributes' })
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(
    () => AttributeHelicopter,
    (attributeHelicopter) => attributeHelicopter.attributes,
  )
  attributeHelicopters: AttributeHelicopter[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
