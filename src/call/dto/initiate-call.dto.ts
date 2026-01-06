import { IsUUID, IsString, IsOptional, Length } from 'class-validator';

export class InitiateCallDto {
  @IsUUID(4, { message: 'Callee ID must be a valid UUID' })
  calleeId: string;

  @IsOptional()
  @IsString()
  @Length(2, 10, { message: 'Language code must be 2-10 characters' })
  callerLanguage?: string;
}
