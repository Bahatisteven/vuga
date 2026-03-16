import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Call } from './call.entity';
import { User } from '../../user/entities';

@Entity('call_log')
@Index(['callId', 'timestamp'])
@Index(['speakerId'])
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'call_id' })
  callId: string;

  @ManyToOne(() => Call, (call) => call.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'call_id' })
  call: Call;

  @Column({ name: 'speaker_id' })
  speakerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'speaker_id' })
  speaker: User;

  @Column({ name: 'original_text', type: 'text' })
  originalText: string;

  @Column({ name: 'translated_text', type: 'text' })
  translatedText: string;

  @Column({ name: 'source_language', length: 10 })
  sourceLanguage: string;

  @Column({ name: 'target_language', length: 10 })
  targetLanguage: string;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
