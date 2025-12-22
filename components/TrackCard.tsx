'use client';

import { Track } from '@/types/database';
import { deleteTrack, updateTrack } from '@/app/actions/playlist-actions';
import { useState } from 'react';

interface TrackCardProps {
  track: Track;
}

export default function TrackCard({ track }: TrackCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [url, setUrl] = useState(track.youtube_url);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim() || !url.trim()) return;

    setLoading(true);
    try {
      await updateTrack(track.id, title, url);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja realmente excluir esta música?')) return;

    setLoading(true);
    try {
      await deleteTrack(track.id);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border bg-transparent border-gray-300 rounded-md mb-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Título da música"
          disabled={loading}
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border bg-transparent border-gray-300 rounded-md mb-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="URL do YouTube"
          disabled={loading}
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Salvar
          </button>
          <button
            onClick={() => setIsEditing(false)}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
            {track.title}
          </h4>
          <a
            href={track.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 truncate"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="truncate">YouTube</span>
          </a>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
            title="Editar"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="p-1.5 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
            title="Excluir"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
