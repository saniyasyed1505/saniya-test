import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGenerationDto {
  @ApiProperty({ example: 'A futuristic cybernetic city at dusk', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Prompt must be at least 3 characters long' })
  prompt: string;

  @ApiProperty({ example: 'dall-e-3' })
  @IsString()
  @IsNotEmpty()
  model: string;
}
