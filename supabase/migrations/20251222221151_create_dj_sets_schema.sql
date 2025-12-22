/*
  # Schema para DJ Set Management

  ## Tabelas Criadas
  
  1. **playlists**
     - `id` (uuid, primary key) - Identificador único da playlist
     - `name` (text) - Nome da playlist
     - `created_at` (timestamptz) - Data de criação
  
  2. **folders**
     - `id` (uuid, primary key) - Identificador único da pasta
     - `name` (text) - Nome da pasta
     - `playlist_id` (uuid, foreign key) - Referência à playlist
     - `created_at` (timestamptz) - Data de criação
  
  3. **tracks**
     - `id` (uuid, primary key) - Identificador único da música
     - `title` (text) - Título da música
     - `youtube_url` (text) - URL do YouTube
     - `folder_id` (uuid, foreign key) - Referência à pasta
     - `created_at` (timestamptz) - Data de criação
  
  ## Segurança
  
  - RLS habilitado em todas as tabelas
  - Políticas permitem acesso público (uso pessoal)
  - Foreign keys com CASCADE para manter integridade referencial
*/

-- Criar tabela de playlists
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de folders
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  playlist_id uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de tracks
CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_url text NOT NULL,
  folder_id uuid NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Políticas para uso pessoal (acesso público para todas as operações)
-- PLAYLISTS
CREATE POLICY "Permitir leitura de playlists"
  ON playlists FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de playlists"
  ON playlists FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de playlists"
  ON playlists FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão de playlists"
  ON playlists FOR DELETE
  TO public
  USING (true);

-- FOLDERS
CREATE POLICY "Permitir leitura de folders"
  ON folders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de folders"
  ON folders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de folders"
  ON folders FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão de folders"
  ON folders FOR DELETE
  TO public
  USING (true);

-- TRACKS
CREATE POLICY "Permitir leitura de tracks"
  ON tracks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de tracks"
  ON tracks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de tracks"
  ON tracks FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão de tracks"
  ON tracks FOR DELETE
  TO public
  USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS folders_playlist_id_idx ON folders(playlist_id);
CREATE INDEX IF NOT EXISTS tracks_folder_id_idx ON tracks(folder_id);