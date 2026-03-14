import { IsUUID, IsString, MinLength, MaxLength } from 'class-validator';

export class JoinCallDto {
  @IsUUID()
  callId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(10)
  language: string;
}
