import {
  Column,
  Entity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
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

  @Column()
  value: string;

  @Column({ primary: true })
  helicopterId: number;

  @ManyToOne(() => Helicopter, (helicopter) => helicopter.attributes)
  helicopter: Helicopter;

  @Column({ primary: true })
  attributesId: number;

  @ManyToOne(() => Attribute, (attributes) => attributes.helicopters)
  attribute: Attribute;
}
