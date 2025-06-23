// src/session/dto/save-to-session.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class SaveToSessionDto {
  @IsString()
  sessionId: string;

  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  artist: string;

  @IsString()
  album: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsString()
  genre: string;

  @IsString()
  image: string;

  @IsString()
  fileUrl: string;

  @IsString()
  fileType: string;
}
