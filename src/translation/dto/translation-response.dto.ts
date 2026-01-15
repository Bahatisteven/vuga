import { IsString, IsNotEmpty, Length } from 'class-validator';

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 5000)
  text: string;

  @IsString()
  @IsNotEmpty()
  sourceLang: string;

  @IsString()
  @IsNotEmpty()
  targetLang: string;
}
