import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemeDto {
  @ApiProperty({ example: 'My wifi died during an interview', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Prompt must be at least 3 characters long' })
  prompt!: string;

  @ApiProperty({ example: 'Image Meme' })
  @IsString()
  @IsNotEmpty()
  mode!: string;

  @ApiProperty({ example: 'Drake', required: false })
  @IsString()
  @IsOptional()
  template?: string;
}
