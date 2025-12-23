import { getPlaylists } from './actions/playlist-actions';
import PlaylistCard from '@/components/PlaylistCard';
import CreatePlaylistButton from '@/components/CreatePlaylistButton';
import Image from 'next/image';

export default async function Home() {
  const playlists = await getPlaylists();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2 flex items-center gap-3">
              <Image
                src="/icon.svg"
                alt="SyncWave Logo"
                className="w-20 h-fit"
                width={48}
                height={48}
              />

              <span className="
                bg-gradient-to-r 
                from-cyan-400 
                via-blue-500 
                to-purple-500
                bg-clip-text 
                text-transparent
              ">
                SyncWave
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Organize suas playlists, pastas e músicas para seus sets de DJ
            </p>
          </div>
          <CreatePlaylistButton />
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-800 mb-6">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Nenhuma playlist ainda
            </h2>
            <p className="text-gray-400 mb-8">
              Crie sua primeira playlist para começar a organizar seus sets de DJ
            </p>
            <CreatePlaylistButton />
          </div>
        ) : (
          <div className="space-y-8">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
