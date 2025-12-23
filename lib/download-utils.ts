import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { YtDlp } from 'ytdlp-nodejs'

const execAsync = promisify(exec);

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
  const command = `yt-dlp -x --audio-format mp3 --cookies ./cookies.txt --referer "https://www.youtube.com" --audio-quality 0 -o "${outputTemplate}" "${youtubeUrl}"`;

  try {
    await execAsync(command);
  } catch (error: any) {
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
