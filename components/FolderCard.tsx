'use client';

import { FolderWithTracks } from '@/types/database';
import { deleteFolder, updateFolder, createTrack } from '@/app/actions/playlist-actions';
import { useState } from 'react';
import TrackCard from './TrackCard';

interface FolderCardProps {
  folder: FolderWithTracks;
}

export default function FolderCard({ folder }: FolderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackUrl, setTrackUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateFolder = async () => {
    if (!folderName.trim()) return;

    setLoading(true);
    try {
      await updateFolder(folder.id, folderName);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!confirm('Deseja realmente excluir esta pasta e todas as suas músicas?')) return;

    setLoading(true);
    try {
      await deleteFolder(folder.id);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleAddTrack = async () => {
    if (!trackTitle.trim() || !trackUrl.trim()) return;

    setLoading(true);
    try {
      await createTrack(folder.id, trackTitle, trackUrl);
      setTrackTitle('');
      setTrackUrl('');
      setIsAddingTrack(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleUpdateFolder}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Salvar
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">{folder.name}</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {folder.tracks?.length || 0} música{(folder.tracks?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-blue-100 rounded-md transition-colors"
                title="Editar pasta"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDeleteFolder}
                disabled={loading}
                className="p-2 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                title="Excluir pasta"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        {folder.tracks?.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>

      {isAddingTrack ? (
        <div className="mt-4 bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <input
            type="text"
            value={trackTitle}
            onChange={(e) => setTrackTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Título da música"
            disabled={loading}
          />
          <input
            type="text"
            value={trackUrl}
            onChange={(e) => setTrackUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="URL do YouTube"
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTrack}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Adicionar Música
            </button>
            <button
              onClick={() => setIsAddingTrack(false)}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTrack(true)}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Música
        </button>
      )}
    </div>
  );
}
