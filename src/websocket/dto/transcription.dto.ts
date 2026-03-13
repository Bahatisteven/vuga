import { IsUUID, IsString, MinLength, MaxLength } from 'class-validator';

export class TranscriptionDto {
  @IsUUID()
  callId: string;

  @IsString()
  @MinLength(1)
  text: string;

  @IsString()
  @MinLength(2)
  @MaxLength(10)
  language: string;
}
