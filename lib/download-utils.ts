import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const execAsync = promisify(exec);

export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function downloadYoutubeAudio(
  youtubeUrl: string,
  outputPath: string,
  fileName: string
): Promise<void> {
  const sanitizedFileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
  const outputTemplate = path.join(outputPath, `${sanitizedFileName}.%(ext)s`);

  const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputTemplate}" "${youtubeUrl}"`;

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

export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
}
