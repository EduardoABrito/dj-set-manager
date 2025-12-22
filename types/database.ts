export interface Playlist {
  id: string;
  name: string;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  playlist_id: string;
  created_at: string;
}

export interface Track {
  id: string;
  title: string;
  youtube_url: string;
  folder_id: string;
  created_at: string;
}

export interface PlaylistWithFolders extends Playlist {
  folders: FolderWithTracks[];
}

export interface FolderWithTracks extends Folder {
  tracks: Track[];
}
