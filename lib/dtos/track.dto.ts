import { Readable } from 'stream';

interface Info {
  title: string;
}

export interface TrackResponseDto {
  info: Info;
  stream: Buffer | Readable;
}

export interface ErrorResponse {
  link: string;
  error: string;
}

export interface DownloadResponseDto {
  zipPath: string;
  errors: ErrorResponse[];
}

export interface TrackInfo {
  title: string;
  genre: string;
  imageUrl: string;
  createdAt: string;
  duration: number;
  bitrate: number;
  id: number | string;
}
