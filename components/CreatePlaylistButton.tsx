'use client';

import { createPlaylist } from '@/app/actions/playlist-actions';
import { useState } from 'react';

export default function CreatePlaylistButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!playlistName.trim()) return;

    setLoading(true);
    try {
      await createPlaylist(playlistName);
      setPlaylistName('');
      setIsCreating(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isCreating) {
    return (
      <div className="bg-transparent border border-gray-300 rounded-xl p-6 shadow-xl">
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="w-full px-4 py-3 border bg-transparent shadow rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nome da playlist"
          disabled={loading}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Criar
          </button>
          <button
            onClick={() => setIsCreating(false)}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Nova Playlist
    </button>
  );
}
