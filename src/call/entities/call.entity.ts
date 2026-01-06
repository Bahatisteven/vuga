import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities';
import { CallLog } from './call-log.entity';

export enum CallStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  MISSED = 'missed',
}

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  Id: string;

  @Column({ name: 'caller_id' })
  callerId: string;

  @Column({ name: 'callee_id' })
  calleeId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'caller_id' })
  caller: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'callee_id' })
  callee: User;

  @Column({
    name: 'start_time',
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
  })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({ name: 'duration_seconds', nullable: true })
  durationSeconds: number | null;

  @Column({ name: 'caller_language', length: 10 })
  callerLanguage: string;

  @Column({ name: 'callee_ language', length: 10 })
  calleeLanguage: string;

  @Column({ type: 'enum', enum: CallStatus, default: CallStatus.ACTIVE })
  status: CallStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => CallLog, (log) => log.call, { cascade: true })
  logs: CallLog[];
}
