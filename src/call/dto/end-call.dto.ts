import { IsString, IsOptional, MaxLength } from 'class-validator';

export class EndCallDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Reason must not exceed 100 characters' })
  reason?: string;
}
