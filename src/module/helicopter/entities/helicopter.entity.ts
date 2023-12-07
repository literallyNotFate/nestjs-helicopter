import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';

import { Engine } from 'src/module/engine/entities/engine.entity';
import { AttributeHelicopter } from 'src/module/attribute-helicopter/entities/attribute-helicopter.entity';

@Entity({ name: 'helicopter' })
export class Helicopter {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ name: 'engine_id', nullable: false })
  @Index()
  engineId!: number;

  @ManyToOne(() => Engine, (engine) => engine.id, { eager: true })
  @JoinColumn({ name: 'engine_id' })
  engine?: Engine;

  // @OneToMany(
  //   () => AttributeHelicopter,
  //   (attributeHelicopter) => attributeHelicopter.helicopter,
  // )
  // attributes: AttributeHelicopter[];
}
