import { ApiProperty } from '@nestjs/swagger';

export class SpeechResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Additional data', required: false })
  data?: any;
}
