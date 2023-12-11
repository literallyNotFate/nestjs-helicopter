import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Attribute } from 'src/module/attributes/entities/attribute.entity';
import { Helicopter } from 'src/module/helicopter/entities/helicopter.entity';

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

  @ManyToMany(() => Helicopter, (helicopter) => helicopter.attributeHelicopter)
  @JoinTable({
    name: 'helicopter_attribute_helicopter',
    joinColumn: { name: 'attribute_helicopter_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'helicopter_id', referencedColumnName: 'id' },
  })
  helicopters: Helicopter[];
}
