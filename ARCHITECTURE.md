# DJ Set Manager - Arquitetura e Implementação

## 🏗️ Arquitetura Geral

Este documento detalha a arquitetura técnica do sistema de gerenciamento de DJ sets.

## 📊 Modelo de Dados

### Schema do Banco de Dados (PostgreSQL/Supabase)

```sql
┌─────────────────┐
│   playlists     │
├─────────────────┤
│ id (PK)         │──┐
│ name            │  │
│ created_at      │  │
└─────────────────┘  │
                     │ 1:N
                     │
                 ┌───▼──────────┐
                 │   folders    │
                 ├──────────────┤
                 │ id (PK)      │──┐
                 │ name         │  │
                 │ playlist_id  │  │
                 │ created_at   │  │
                 └──────────────┘  │
                                   │ 1:N
                                   │
                              ┌────▼─────────┐
                              │   tracks     │
                              ├──────────────┤
                              │ id (PK)      │
                              │ title        │
                              │ youtube_url  │
                              │ folder_id    │
                              │ created_at   │
                              └──────────────┘
```

### Tabelas

#### `playlists`
- **Propósito**: Armazena as playlists principais
- **Campos**:
  - `id`: UUID (Primary Key)
  - `name`: TEXT (Nome da playlist)
  - `created_at`: TIMESTAMPTZ (Data de criação)

#### `folders`
- **Propósito**: Organiza músicas em pastas dentro de playlists
- **Campos**:
  - `id`: UUID (Primary Key)
  - `name`: TEXT (Nome da pasta)
  - `playlist_id`: UUID (Foreign Key → playlists.id)
  - `created_at`: TIMESTAMPTZ (Data de criação)
- **Relacionamento**:
  - Muitas pastas pertencem a uma playlist
  - Deleção em cascata (se a playlist for deletada, as pastas também são)

#### `tracks`
- **Propósito**: Armazena as músicas (links do YouTube)
- **Campos**:
  - `id`: UUID (Primary Key)
  - `title`: TEXT (Título da música)
  - `youtube_url`: TEXT (URL do vídeo no YouTube)
  - `folder_id`: UUID (Foreign Key → folders.id)
  - `created_at`: TIMESTAMPTZ (Data de criação)
- **Relacionamento**:
  - Muitas músicas pertencem a uma pasta
  - Deleção em cascata (se a pasta for deletada, as músicas também são)

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas públicas para uso pessoal:

- **SELECT**: Permitido para todos (público)
- **INSERT**: Permitido para todos (público)
- **UPDATE**: Permitido para todos (público)
- **DELETE**: Permitido para todos (público)

> **Nota**: Para uso em produção multiusuário, as políticas devem ser ajustadas para usar `auth.uid()`.

### Índices

```sql
CREATE INDEX folders_playlist_id_idx ON folders(playlist_id);
CREATE INDEX tracks_folder_id_idx ON tracks(folder_id);
```

Esses índices otimizam as consultas de busca de pastas por playlist e músicas por pasta.

## 🎨 Arquitetura Frontend

### Estrutura de Componentes

```
app/page.tsx (Server Component)
│
├── CreatePlaylistButton (Client Component)
│
└── PlaylistCard (Client Component)
    │
    ├── FolderCard (Client Component)
    │   │
    │   └── TrackCard (Client Component)
    │
    └── Download Button
```

### Componentes

#### `page.tsx` (Server Component)
- **Tipo**: Server Component (Next.js 13 App Router)
- **Responsabilidade**:
  - Buscar playlists com Server Actions
  - Renderizar layout principal
  - Exibir estado vazio quando não há playlists

#### `CreatePlaylistButton` (Client Component)
- **Tipo**: Client Component ('use client')
- **Estado**:
  - `isCreating`: Controla modal de criação
  - `playlistName`: Nome da nova playlist
  - `loading`: Estado de carregamento
- **Ações**:
  - Criar nova playlist via Server Action
  - Validação de entrada

#### `PlaylistCard` (Client Component)
- **Props**: `PlaylistWithFolders`
- **Estado**:
  - `isEditing`: Modo de edição
  - `isAddingFolder`: Modal de adicionar pasta
  - `downloading`: Estado de download
- **Funcionalidades**:
  - Editar nome da playlist
  - Deletar playlist
  - Adicionar pasta
  - Baixar playlist completa
- **Estilo**: Card escuro (slate-800/900) com gradiente

#### `FolderCard` (Client Component)
- **Props**: `FolderWithTracks`
- **Estado**:
  - `isEditing`: Modo de edição
  - `isAddingTrack`: Modal de adicionar música
- **Funcionalidades**:
  - Editar nome da pasta
  - Deletar pasta
  - Adicionar música
- **Estilo**: Card azul claro com gradiente

#### `TrackCard` (Client Component)
- **Props**: `Track`
- **Estado**:
  - `isEditing`: Modo de edição
- **Funcionalidades**:
  - Editar título e URL
  - Deletar música
  - Link direto para YouTube
- **Estilo**: Card branco compacto com hover effects

## 🔄 Fluxo de Dados

### Operações CRUD

#### Server Actions (app/actions/playlist-actions.ts)

Todas as operações CRUD usam Server Actions do Next.js 13:

```typescript
'use server';

// Exemplos de funções:
- getPlaylists()        // Busca todas as playlists com folders e tracks
- createPlaylist(name)  // Cria nova playlist
- updatePlaylist(id, name) // Atualiza nome
- deletePlaylist(id)    // Deleta playlist
- createFolder(playlistId, name)
- createTrack(folderId, title, url)
// ... e outras operações
```

**Características**:
- `'use server'` no topo do arquivo
- Uso de `revalidatePath('/')` após mutações
- Tratamento de erros com mensagens em português
- Queries aninhadas com Supabase

### Consulta de Playlists

```typescript
const { data: playlists } = await supabase
  .from('playlists')
  .select(`
    *,
    folders (
      *,
      tracks (*)
    )
  `)
  .order('created_at', { ascending: false });
```

Esta query retorna toda a estrutura hierárquica em uma única chamada.

## 📥 Sistema de Download

### Visão Geral do Fluxo

```
┌──────────────┐
│   Frontend   │
│ (Usuário)    │
└──────┬───────┘
       │ 1. POST /api/playlists/:id/download
       │
┌──────▼────────────────────────────────────────────────┐
│ Backend (API Route)                                    │
│                                                        │
│ 2. Buscar dados do Supabase                          │
│    ├─ Playlist                                        │
│    ├─ Folders                                         │
│    └─ Tracks                                          │
│                                                        │
│ 3. Criar estrutura de pastas em /tmp                 │
│    └─ /tmp/playlist-{id}-{timestamp}/                │
│        └─ {PlaylistName}/                            │
│            ├─ {FolderName1}/                         │
│            └─ {FolderName2}/                         │
│                                                        │
│ 4. Para cada track:                                   │
│    └─ yt-dlp -x --audio-format mp3 {youtube_url}    │
│       └─ Salvar como {TrackTitle}.mp3               │
│                                                        │
│ 5. Criar arquivo ZIP                                  │
│    └─ archiver (compressão nível 9)                 │
│                                                        │
│ 6. Enviar ZIP para o cliente                         │
│                                                        │
│ 7. Limpeza                                            │
│    ├─ Deletar pasta temporária                       │
│    └─ Deletar arquivo ZIP                            │
└───────────────────────────────────────────────────────┘
       │
       │ 8. Resposta: Binary ZIP file
       │
┌──────▼───────┐
│   Frontend   │
│ (Download)   │
└──────────────┘
```

### Implementação Detalhada

#### API Route (`app/api/playlists/[playlistId]/download/route.ts`)

**Passo 1: Buscar Dados**

```typescript
const { data: playlist } = await supabase
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
```

**Passo 2: Criar Estrutura de Diretórios**

```typescript
const tmpDir = '/tmp/dj-sets-downloads';
const playlistDir = path.join(tmpDir, `playlist-${playlistId}-${Date.now()}`);
const playlistPath = path.join(playlistDir, sanitizeFileName(playlist.name));
```

**Passo 3: Download com yt-dlp**

```typescript
const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputTemplate}" "${youtubeUrl}"`;
await execAsync(command);
```

**Parâmetros do yt-dlp**:
- `-x`: Extrair apenas áudio
- `--audio-format mp3`: Converter para MP3
- `--audio-quality 0`: Melhor qualidade
- `-o`: Template de saída com nome do arquivo

**Passo 4: Compressão ZIP**

```typescript
const archive = archiver('zip', { zlib: { level: 9 } });
archive.directory(playlistDir, false);
archive.finalize();
```

**Passo 5: Envio e Limpeza**

```typescript
const zipBuffer = await fs.readFile(zipPath);

// Limpeza
await cleanupDirectory(playlistDir);
await fs.unlink(zipPath);

// Resposta
return new NextResponse(zipBuffer, {
  headers: {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${sanitizedPlaylistName}.zip"`,
  },
});
```

### Funções Utilitárias (lib/download-utils.ts)

#### `ensureDirectory(dirPath)`
Cria diretório se não existir (recursivo).

#### `downloadYoutubeAudio(url, output, fileName)`
- Sanitiza nome do arquivo
- Executa yt-dlp com parâmetros otimizados
- Trata erros de download

#### `createZipFromDirectory(sourceDir, outputZip)`
- Usa biblioteca `archiver`
- Compressão máxima (level 9)
- Stream para eficiência de memória

#### `cleanupDirectory(dirPath)`
Remove diretório e todo seu conteúdo recursivamente.

#### `sanitizeFileName(name)`
Remove caracteres inválidos para nomes de arquivo:
- `/`, `\`, `?`, `%`, `*`, `:`, `|`, `"`, `<`, `>`

### Tratamento de Erros

#### Frontend
```typescript
try {
  const response = await fetch(`/api/playlists/${id}/download`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  // Download do blob
} catch (error) {
  alert(error.message);
}
```

#### Backend
- Erros de download de tracks individuais são logados mas não interrompem o processo
- Erro fatal: Limpeza de arquivos temporários antes de retornar erro
- Mensagens de erro em português

### Estados de Loading

#### PlaylistCard
```typescript
const [downloading, setDownloading] = useState(false);

// Durante download:
// - Botão mostra "Baixando..." com spinner
// - Botão desabilitado
// - Feedback visual com animação
```

## 🎨 Design System

### Paleta de Cores

#### Background Principal
```css
bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
```

#### Cards de Playlist
```css
bg-gradient-to-br from-slate-800 to-slate-900
border-slate-700
```

#### Cards de Pasta
```css
bg-gradient-to-br from-blue-50 to-white
border-blue-100
```

#### Cards de Track
```css
bg-gradient-to-br from-white to-gray-50
border-gray-200
```

#### Botões de Ação
- **Primary**: `bg-gradient-to-r from-blue-600 to-blue-500`
- **Success**: `bg-gradient-to-r from-green-600 to-green-500`
- **Danger**: `bg-red-600`
- **Secondary**: `bg-gray-200` ou `bg-slate-700`

### Efeitos Visuais

#### Sombras
- Cards: `shadow-lg` → `shadow-xl` (hover)
- Botões: `shadow-md` → `shadow-lg` (hover)

#### Transições
```css
transition-all duration-300
transition-colors
```

#### Hover States
- Botões: Mudança de cor + sombra
- Cards: Aumento de sombra
- Tracks: Opacity de botões (0 → 100%)

#### Animações
- Spinner de loading: `animate-spin`
- Transforms: `group-hover:translate-x-1`

### Tipografia

#### Títulos
- H1: `text-5xl font-bold text-white`
- H2: `text-3xl font-bold text-white`
- H3: `text-lg font-bold text-gray-800`

#### Corpo
- Normal: `text-gray-400` ou `text-gray-700`
- Small: `text-sm` ou `text-xs`

### Ícones

Todos os ícones são SVG inline do Heroicons (via Tailwind):
- 🎵 Música: `M9 19V6l12-3v13...`
- 📁 Pasta: `M3 7v10a2 2 0 002 2h14...`
- ➕ Adicionar: `M12 4v16m8-8H4`
- ✏️ Editar: `M11 5H6a2 2 0 00-2 2v11...`
- 🗑️ Deletar: `M19 7l-.867 12.142A2...`
- ⬇️ Download: `M4 16v1a3 3 0 003 3h10...`
- 🔗 YouTube: Logo customizado

## 🔒 Segurança

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: URL pública (safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública (safe com RLS)

### RLS (Row Level Security)
- Todas as tabelas protegidas
- Políticas configuráveis por tabela
- Para produção multiusuário: Implementar políticas baseadas em `auth.uid()`

### Sanitização
- Nomes de arquivo sanitizados antes de salvar em disco
- Validação de URLs do YouTube no frontend
- Tratamento de erros de comandos externos (yt-dlp)

### Limpeza de Arquivos
- Arquivos temporários sempre deletados após uso
- Try/catch em operações de limpeza
- Uso de `/tmp` para arquivos temporários

## 🚀 Performance

### Otimizações de Banco de Dados
- Índices em foreign keys
- Query única com joins aninhados
- Ordenação no banco (não no cliente)

### Otimizações de Frontend
- Server Components por padrão
- Client Components apenas quando necessário
- Lazy loading implícito do Next.js

### Otimizações de Download
- Streams para ZIP (não carrega tudo em memória)
- Download paralelo possível (implementação futura)
- Compressão máxima para reduzir tamanho

## 🧪 Considerações de Escalabilidade

### Limitações Atuais
- Download síncrono (bloqueia até completar)
- Sem fila de jobs
- Sem monitoramento de progresso em tempo real
- Limite de tamanho do servidor (`/tmp`)

### Melhorias Futuras
1. **Sistema de Fila**
   - Bull ou BullMQ para jobs assíncronos
   - Background workers

2. **Progresso em Tempo Real**
   - WebSockets ou Server-Sent Events
   - Barra de progresso por música

3. **Cache**
   - Cache de músicas já baixadas
   - Deduplicação por URL

4. **Armazenamento**
   - S3 ou similar para arquivos grandes
   - CDN para entrega

5. **Autenticação**
   - Supabase Auth
   - Políticas RLS por usuário

---

**Versão**: 1.0
**Data**: Dezembro 2024
**Tecnologias**: Next.js 13, Supabase, yt-dlp, TypeScript, Tailwind CSS
