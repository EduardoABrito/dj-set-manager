'use client';

import { PlaylistWithFolders } from '@/types/database';
import { deletePlaylist, updatePlaylist, createFolder } from '@/app/actions/playlist-actions';
import { useState } from 'react';
import FolderCard from './FolderCard';

interface PlaylistCardProps {
  playlist: PlaylistWithFolders;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [playlistName, setPlaylistName] = useState(playlist.name);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleUpdatePlaylist = async () => {
    if (!playlistName.trim()) return;

    setLoading(true);
    try {
      await updatePlaylist(playlist.id, playlistName);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Deseja realmente excluir esta playlist e todo seu conteúdo?')) return;

    setLoading(true);
    try {
      await deletePlaylist(playlist.id);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleAddFolder = async () => {
    if (!folderName.trim()) return;

    setLoading(true);
    try {
      await createFolder(playlist.id, folderName);
      setFolderName('');
      setIsAddingFolder(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao baixar playlist');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playlist.name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setDownloading(false);
    }
  };

  const totalTracks = playlist.folders?.reduce((sum, folder) => sum + (folder.tracks?.length || 0), 0) || 0;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700 hover:shadow-3xl transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        {isEditing ? (
          <div className="flex-1 flex gap-3">
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="flex-1 px-4 py-3 border bg-transparent border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleUpdatePlaylist}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Salvar
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h2 className="text-3xl font-bold text-white">{playlist.name}</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {playlist.folders?.length || 0} pasta{(playlist.folders?.length || 0) !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  {totalTracks} música{totalTracks !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading || totalTracks === 0}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={totalTracks === 0 ? 'Adicione músicas antes de baixar' : 'Baixar Playlist'}
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Baixando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Baixar Playlist
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-3 hover:bg-slate-700 rounded-lg transition-colors"
                title="Editar playlist"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDeletePlaylist}
                disabled={loading}
                className="p-3 hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
                title="Excluir playlist"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        {playlist.folders?.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>

      {isAddingFolder ? (
        <div className="mt-4 bg-transparent border border-gray-300 rounded-lg p-4 shadow-md">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full px-4 py-3 border bg-transparent border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome da pasta"
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddFolder}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Criar Pasta
            </button>
            <button
              onClick={() => setIsAddingFolder(false)}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingFolder(true)}
          className="mt-4 w-full bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Adicionar Pasta
        </button>
      )}
    </div>
  );
}
