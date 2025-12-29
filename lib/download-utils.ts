import * as fs from 'fs/promises';
import * as path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import Innertube, { ClientType, UniversalCache } from 'youtubei.js';
import { extractVideoId } from '@/utils/extractVideoId.util';
import { Readable }  from 'stream'

export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}


export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')                     
    .replace(/[\u0300-\u036f]/g, '')      
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')          
    .replace(/^-+|-+$/g, '');            
}

export async function downloadYoutubeAudio(
  youtubeUrl: string,
  outputPath: string,
  fileName: string
): Promise<void> {
  const sanitizedFileName = sanitizeFileName(fileName);
  const outputTemplate = path.join(outputPath, `${sanitizedFileName}.mp3`);
  const videoId = extractVideoId(youtubeUrl);
  try {
  
  const yt = await Innertube.create({ 
    cache: new UniversalCache(false),
    generate_session_locally: true, 
    client_type: ClientType.ANDROID
  });  

  const stream = await yt.download(videoId!, {
    type: 'audio', 
    quality: 'best',
    format: 'mp4a',
  });
    
  const file = createWriteStream(outputTemplate);
  
  Readable.fromWeb(stream as any).pipe(file);

  } catch (error: any) {
    console.log(error)
    throw new Error(`Erro ao baixar áudio do YouTube: ${error.message}`);
  }
}

export async function createZipFromDirectory(
  sourceDir: string,
  outputZipPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

export async function cleanupDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.error('Erro ao limpar diretório:', error);
  }
}
