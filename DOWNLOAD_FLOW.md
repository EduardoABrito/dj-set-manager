# Fluxo de Download de Playlist - Explicação Completa

## 📋 Visão Geral

O sistema de download permite que o usuário baixe uma playlist completa em formato ZIP, contendo todos os áudios das músicas organizados em pastas, exatamente como estruturado no banco de dados.

## 🔄 Fluxo Completo Passo a Passo

### Passo 1: Ação do Usuário (Frontend)

**Local**: `components/PlaylistCard.tsx`

```typescript
// Usuário clica no botão "Baixar Playlist"
const handleDownload = async () => {
  setDownloading(true); // Ativa estado de loading

  try {
    // Envia requisição POST para a API
    const response = await fetch(`/api/playlists/${playlist.id}/download`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao baixar playlist');
    }

    // Recebe o arquivo ZIP como blob
    const blob = await response.blob();

    // Cria URL temporária para download
    const url = window.URL.createObjectURL(blob);

    // Cria elemento <a> invisível e dispara download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name}.zip`;
    document.body.appendChild(a);
    a.click();

    // Limpeza
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error: any) {
    alert(error.message);
  } finally {
    setDownloading(false); // Desativa estado de loading
  }
};
```

**Feedback Visual**:
- Botão muda de "Baixar Playlist" para "Baixando..."
- Ícone muda para spinner animado
- Botão fica desabilitado durante o processo

---

### Passo 2: Recepção da Requisição (Backend)

**Local**: `app/api/playlists/[playlistId]/download/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  const { playlistId } = params;

  // Define diretórios temporários
  const tmpDir = path.join('/tmp', 'dj-sets-downloads');
  const playlistDir = path.join(tmpDir, `playlist-${playlistId}-${Date.now()}`);
  const zipPath = `${playlistDir}.zip`;

  // ... processamento
}
```

**Diretórios Criados**:
```
/tmp/dj-sets-downloads/
  └── playlist-[id]-[timestamp]/
      └── [Nome da Playlist]/
          ├── [Pasta 1]/
          │   ├── musica1.mp3
          │   └── musica2.mp3
          └── [Pasta 2]/
              └── musica3.mp3
```

---

### Passo 3: Busca de Dados do Supabase

```typescript
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
```

**Estrutura de Dados Retornada**:
```typescript
{
  id: "uuid",
  name: "Minha Playlist",
  created_at: "2024-01-01T00:00:00Z",
  folders: [
    {
      id: "uuid",
      name: "Openers",
      playlist_id: "uuid",
      created_at: "2024-01-01T00:00:00Z",
      tracks: [
        {
          id: "uuid",
          title: "Track 1",
          youtube_url: "https://youtube.com/watch?v=xxx",
          folder_id: "uuid",
          created_at: "2024-01-01T00:00:00Z"
        },
        // ... mais tracks
      ]
    },
    // ... mais folders
  ]
}
```

**Validações**:
- Playlist existe?
- Playlist tem pelo menos uma pasta?
- Pastas têm músicas?

---

### Passo 4: Criação da Estrutura de Diretórios

```typescript
// Criar diretório base
await ensureDirectory(tmpDir);
await ensureDirectory(playlistDir);

// Criar pasta da playlist
const sanitizedPlaylistName = sanitizeFileName(playlist.name);
const playlistPath = path.join(playlistDir, sanitizedPlaylistName);
await ensureDirectory(playlistPath);

// Para cada folder
for (const folder of playlist.folders) {
  const sanitizedFolderName = sanitizeFileName(folder.name);
  const folderPath = path.join(playlistPath, sanitizedFolderName);
  await ensureDirectory(folderPath);
}
```

**Função `ensureDirectory`**:
```typescript
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath); // Tenta acessar
  } catch {
    await fs.mkdir(dirPath, { recursive: true }); // Cria se não existir
  }
}
```

**Função `sanitizeFileName`**:
```typescript
export function sanitizeFileName(name: string): string {
  // Remove caracteres inválidos em nomes de arquivo
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
}
```

**Exemplo de Sanitização**:
- `"Playlist: Tech/House"` → `"Playlist- Tech-House"`
- `"Set 2024 <Winter>?"` → `"Set 2024 -Winter--"`

---

### Passo 5: Download dos Áudios com yt-dlp

```typescript
for (const folder of playlist.folders) {
  if (!folder.tracks || folder.tracks.length === 0) {
    continue; // Pula pastas vazias
  }

  const folderPath = path.join(playlistPath, sanitizeFileName(folder.name));

  for (const track of folder.tracks) {
    try {
      console.log(`Baixando: ${track.title} de ${track.youtube_url}`);

      // Função de download
      await downloadYoutubeAudio(
        track.youtube_url,
        folderPath,
        track.title
      );

    } catch (error: any) {
      // Loga o erro mas continua com as próximas músicas
      console.error(`Erro ao baixar ${track.title}:`, error.message);
    }
  }
}
```

**Função `downloadYoutubeAudio`**:
```typescript
export async function downloadYoutubeAudio(
  youtubeUrl: string,
  outputPath: string,
  fileName: string
): Promise<void> {
  // Sanitiza nome do arquivo
  const sanitizedFileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');

  // Template de saída (yt-dlp substituirá %(ext)s por mp3)
  const outputTemplate = path.join(outputPath, `${sanitizedFileName}.%(ext)s`);

  // Comando yt-dlp
  const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputTemplate}" "${youtubeUrl}"`;

  try {
    await execAsync(command);
  } catch (error: any) {
    throw new Error(`Erro ao baixar áudio do YouTube: ${error.message}`);
  }
}
```

**Parâmetros do yt-dlp**:

| Parâmetro | Descrição |
|-----------|-----------|
| `-x` | Extrair apenas áudio (sem vídeo) |
| `--audio-format mp3` | Converter para formato MP3 |
| `--audio-quality 0` | Melhor qualidade de áudio (0 = melhor, 9 = pior) |
| `-o "template"` | Template de nome do arquivo de saída |
| `"url"` | URL do vídeo do YouTube |

**Exemplo de Comando Gerado**:
```bash
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  -o "/tmp/playlist-123-456/Minha Playlist/Openers/Track 1.%(ext)s" \
  "https://youtube.com/watch?v=xxx"
```

**Resultado**:
```
/tmp/playlist-123-456/Minha Playlist/Openers/Track 1.mp3
```

**Tratamento de Erros**:
- Link inválido: Loga erro e continua
- Vídeo privado: Loga erro e continua
- Erro de rede: Loga erro e continua
- Música é pulada, mas download não é interrompido

---

### Passo 6: Compressão em ZIP

```typescript
console.log('Criando arquivo ZIP...');
await createZipFromDirectory(playlistDir, zipPath);
```

**Função `createZipFromDirectory`**:
```typescript
export async function createZipFromDirectory(
  sourceDir: string,
  outputZipPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Stream de saída
    const output = createWriteStream(outputZipPath);

    // Archiver com compressão máxima
    const archive = archiver('zip', {
      zlib: { level: 9 } // Nível 9 = máxima compressão
    });

    // Event handlers
    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    // Conecta archive ao output stream
    archive.pipe(output);

    // Adiciona todo o diretório ao ZIP (false = sem pasta raiz)
    archive.directory(sourceDir, false);

    // Finaliza (dispara compressão)
    archive.finalize();
  });
}
```

**Configuração do Archiver**:
- `level: 9`: Máxima compressão (mais lento, menor tamanho)
- `false` como segundo parâmetro: Remove pasta raiz do ZIP

**Estrutura do ZIP**:
```
playlist.zip
  └── Minha Playlist/
      ├── Openers/
      │   ├── Track 1.mp3
      │   └── Track 2.mp3
      └── Peak Time/
          └── Track 3.mp3
```

---

### Passo 7: Leitura e Envio do ZIP

```typescript
// Lê arquivo ZIP em buffer
const zipBuffer = await fs.readFile(zipPath);

// Limpeza de arquivos temporários
await cleanupDirectory(playlistDir);
await fs.unlink(zipPath);

// Retorna ZIP como resposta HTTP
return new NextResponse(zipBuffer, {
  headers: {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${sanitizedPlaylistName}.zip"`,
  },
});
```

**Headers HTTP**:

| Header | Valor | Descrição |
|--------|-------|-----------|
| `Content-Type` | `application/zip` | Indica que é um arquivo ZIP |
| `Content-Disposition` | `attachment; filename="..."` | Força download com nome específico |

**Função `cleanupDirectory`**:
```typescript
export async function cleanupDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.error('Erro ao limpar diretório:', error);
  }
}
```

**Arquivos Deletados**:
- Pasta temporária completa (`/tmp/playlist-123-456/`)
- Todas as subpastas e MP3s
- Arquivo ZIP (`playlist-123-456.zip`)

---

### Passo 8: Recepção no Frontend

```typescript
// Frontend recebe o blob
const blob = await response.blob();

// Cria URL temporária do blob
const url = window.URL.createObjectURL(blob);

// Dispara download
const a = document.createElement('a');
a.href = url;
a.download = `${playlist.name}.zip`;
document.body.appendChild(a);
a.click();

// Limpeza
window.URL.revokeObjectURL(url);
document.body.removeChild(a);
```

**Resultado Final**:
Arquivo `Minha Playlist.zip` é baixado para a pasta de Downloads do usuário.

---

## ⚠️ Tratamento de Erros

### Erros no Frontend

```typescript
catch (error: any) {
  alert(error.message); // Exibe erro em português
} finally {
  setDownloading(false); // Sempre desativa loading
}
```

### Erros no Backend

```typescript
catch (error: any) {
  console.error('Erro ao processar download:', error);

  // Limpeza em caso de erro
  await cleanupDirectory(playlistDir);
  try {
    await fs.unlink(zipPath);
  } catch {}

  // Retorna erro HTTP 500
  return NextResponse.json(
    { error: 'Erro ao processar download: ' + error.message },
    { status: 500 }
  );
}
```

**Tipos de Erro**:

| Erro | Status | Mensagem |
|------|--------|----------|
| Playlist não encontrada | 404 | "Playlist não encontrada" |
| Playlist vazia | 400 | "Playlist vazia" |
| Erro de download | 500 | "Erro ao processar download: ..." |

---

## 📊 Diagrama de Sequência

```
Usuário                Frontend              API Route           Supabase        yt-dlp
   |                      |                      |                   |              |
   |--[Click Download]--->|                      |                   |              |
   |                      |                      |                   |              |
   |                      |---[POST /api/...]-->|                   |              |
   |                      |                      |                   |              |
   |                      |                      |--[SELECT query]-->|              |
   |                      |                      |<--[Playlist data]-|              |
   |                      |                      |                   |              |
   |                      |                      |--[mkdir /tmp/...]-|              |
   |                      |                      |                   |              |
   |                      |                      |-----[download track 1]---------->|
   |                      |                      |<-----[track1.mp3]----------------|
   |                      |                      |                   |              |
   |                      |                      |-----[download track 2]---------->|
   |                      |                      |<-----[track2.mp3]----------------|
   |                      |                      |                   |              |
   |                      |                      |--[create ZIP]---->|              |
   |                      |                      |<--[ZIP file]------|              |
   |                      |                      |                   |              |
   |                      |                      |--[cleanup tmp]--->|              |
   |                      |                      |                   |              |
   |                      |<--[ZIP blob]---------|                   |              |
   |                      |                      |                   |              |
   |<--[File Download]----|                      |                   |              |
   |                      |                      |                   |              |
```

---

## 🔧 Otimizações e Melhorias Futuras

### Implementadas

✅ Compressão máxima (level 9)
✅ Sanitização de nomes de arquivo
✅ Limpeza automática de arquivos temporários
✅ Tratamento individual de erros por música
✅ Uso de streams para ZIP (eficiência de memória)

### Sugestões para Futuro

⬜ Download paralelo de múltiplas músicas
⬜ Barra de progresso em tempo real (WebSockets)
⬜ Sistema de fila (Bull/BullMQ)
⬜ Cache de músicas já baixadas
⬜ Retry automático em caso de falha
⬜ Limite de taxa de download
⬜ Compressão adaptativa baseada no tamanho

---

## 🎯 Considerações de Performance

### Tempo de Download

**Fatores que influenciam**:
- Número de músicas
- Tamanho dos áudios
- Velocidade da internet
- Carga do servidor yt-dlp

**Estimativa**:
- 1 música: ~10-30 segundos
- 10 músicas: ~2-5 minutos
- 50 músicas: ~10-25 minutos

### Uso de Recursos

**Espaço em Disco**:
- Temporário: ~5-10MB por música
- Limpeza automática após envio

**Memória**:
- ZIP em buffer antes do envio
- Para playlists grandes, considerar streaming

**CPU**:
- yt-dlp: Conversão de formato
- archiver: Compressão ZIP

---

## 🔒 Segurança

### Sanitização
- Nomes de arquivo são sanitizados
- Previne path traversal
- Remove caracteres especiais

### Isolamento
- Uso de `/tmp` (limpeza automática do SO)
- Diretórios únicos por requisição (timestamp)
- Limpeza manual adicional

### Validação
- Verificação de existência da playlist
- Validação de estrutura de dados
- Tratamento de erros por música

---

**Este fluxo garante uma experiência robusta e profissional para o download de playlists completas!** 🎧
