'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import type { PlaylistWithFolders } from '@/types/database';

export async function getPlaylists(): Promise<PlaylistWithFolders[]> {
  const { data: playlists, error } = await supabase
    .from('playlists')
    .select(`
      *,
      folders (
        *,
        tracks (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar playlists:', error);
    return [];
  }

  return playlists as PlaylistWithFolders[];
}

export async function createPlaylist(name: string) {
  const { data, error } = await supabase
    .from('playlists')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    throw new Error('Erro ao criar playlist: ' + error.message);
  }

  revalidatePath('/');
  return data;
}

export async function updatePlaylist(id: string, name: string) {
  const { error } = await supabase
    .from('playlists')
    .update({ name })
    .eq('id', id);

  if (error) {
    throw new Error('Erro ao atualizar playlist: ' + error.message);
  }

  revalidatePath('/');
}

export async function deletePlaylist(id: string) {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Erro ao excluir playlist: ' + error.message);
  }

  revalidatePath('/');
}

export async function createFolder(playlistId: string, name: string) {
  const { data, error } = await supabase
    .from('folders')
    .insert([{ playlist_id: playlistId, name }])
    .select()
    .single();

  if (error) {
    throw new Error('Erro ao criar pasta: ' + error.message);
  }

  revalidatePath('/');
  return data;
}

export async function updateFolder(id: string, name: string) {
  const { error } = await supabase
    .from('folders')
    .update({ name })
    .eq('id', id);

  if (error) {
    throw new Error('Erro ao atualizar pasta: ' + error.message);
  }

  revalidatePath('/');
}

export async function deleteFolder(id: string) {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Erro ao excluir pasta: ' + error.message);
  }

  revalidatePath('/');
}

export async function createTrack(folderId: string, title: string, youtubeUrl: string) {
  const { data, error } = await supabase
    .from('tracks')
    .insert([{ folder_id: folderId, title, youtube_url: youtubeUrl }])
    .select()
    .single();

  if (error) {
    throw new Error('Erro ao adicionar música: ' + error.message);
  }

  revalidatePath('/');
  return data;
}

export async function updateTrack(id: string, title: string, youtubeUrl: string) {
  const { error } = await supabase
    .from('tracks')
    .update({ title, youtube_url: youtubeUrl })
    .eq('id', id);

  if (error) {
    throw new Error('Erro ao atualizar música: ' + error.message);
  }

  revalidatePath('/');
}

export async function deleteTrack(id: string) {
  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Erro ao excluir música: ' + error.message);
  }

  revalidatePath('/');
}
