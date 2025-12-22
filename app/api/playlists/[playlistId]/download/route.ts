import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  ensureDirectory,
  downloadYoutubeAudio,
  createZipFromDirectory,
  cleanupDirectory,
  sanitizeFileName
} from '@/lib/download-utils';

interface RouteParams {
  params: {
    playlistId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { playlistId } = params;
  const tmpDir = path.join('/tmp', 'dj-sets-downloads');
  const playlistDir = path.join(tmpDir, `playlist-${playlistId}-${Date.now()}`);
  const zipPath = `${playlistDir}.zip`;

  try {
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select(`
        *,
        folders (
          *,
          tracks (*)
        )
      `)
      .eq('id', playlistId)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json(
        { error: 'Playlist não encontrada' },
        { status: 404 }
      );
    }

    if (!playlist.folders || playlist.folders.length === 0) {
      return NextResponse.json(
        { error: 'Playlist vazia' },
        { status: 400 }
      );
    }

    await ensureDirectory(tmpDir);
    await ensureDirectory(playlistDir);

    const sanitizedPlaylistName = sanitizeFileName(playlist.name);
    const playlistPath = path.join(playlistDir, sanitizedPlaylistName);
    await ensureDirectory(playlistPath);

    for (const folder of playlist.folders) {
      if (!folder.tracks || folder.tracks.length === 0) {
        continue;
      }

      const sanitizedFolderName = sanitizeFileName(folder.name);
      const folderPath = path.join(playlistPath, sanitizedFolderName);
      await ensureDirectory(folderPath);

      for (const track of folder.tracks) {
        try {
          console.log(`Baixando: ${track.title} de ${track.youtube_url}`);
          await downloadYoutubeAudio(track.youtube_url, folderPath, track.title);
        } catch (error: any) {
          console.error(`Erro ao baixar ${track.title}:`, error.message);
        }
      }
    }

    console.log('Criando arquivo ZIP...');
    await createZipFromDirectory(playlistDir, zipPath);

    const zipBuffer = await fs.readFile(zipPath);

    await cleanupDirectory(playlistDir);
    await fs.unlink(zipPath);

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${sanitizedPlaylistName}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao processar download:', error);

    await cleanupDirectory(playlistDir);
    try {
      await fs.unlink(zipPath);
    } catch {}

    return NextResponse.json(
      { error: 'Erro ao processar download: ' + error.message },
      { status: 500 }
    );
  }
}
