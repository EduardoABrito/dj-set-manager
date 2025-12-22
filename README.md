# 🎧 DJ Set Manager

Uma aplicação web moderna para gerenciar sets de DJ, organizando playlists, pastas e músicas do YouTube com funcionalidade de download completo.

![Stack](https://img.shields.io/badge/Next.js-13-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## ✨ Funcionalidades

- 📋 **Gerenciamento de Playlists**: Crie e organize múltiplas playlists
- 📁 **Organização por Pastas**: Agrupe músicas por gênero, BPM ou qualquer critério
- 🎵 **Tracks do YouTube**: Adicione músicas usando links do YouTube
- ⬇️ **Download Completo**: Baixe playlists inteiras em formato MP3 organizadas por pastas
- 🎨 **UI Moderna**: Interface card-based limpa e intuitiva
- 🇧🇷 **Português Brasileiro**: Toda interface em PT-BR

## 🏗️ Tecnologias

- **Framework**: Next.js 13 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: Supabase (PostgreSQL)
- **Estilização**: Tailwind CSS
- **Download**: yt-dlp
- **Compressão**: archiver

## 🚀 Início Rápido

### 1. Pré-requisitos

- Node.js 18+
- Conta no Supabase (gratuita)
- yt-dlp instalado

### 2. Instalação

```bash
# Clone o repositório
git clone [seu-repositorio]
cd dj-set-manager

# Instale as dependências
npm install
```

### 3. Configuração

1. Crie um projeto no [Supabase](https://supabase.com)

2. Configure as variáveis de ambiente no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

3. O schema do banco já foi criado automaticamente no Supabase!

### 4. Execute

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📖 Documentação

- **[SETUP.md](./SETUP.md)** - Guia completo de configuração e uso
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Documentação técnica detalhada da arquitetura

## 🎯 Como Usar

### Criar uma Playlist

1. Clique em **"Nova Playlist"**
2. Digite o nome (ex: "Set Techno 2024")
3. Clique em **"Criar"**

### Adicionar Pastas

1. Dentro da playlist, clique em **"Adicionar Pasta"**
2. Nomeie a pasta (ex: "Openers", "Peak Time", "Closing")
3. Clique em **"Criar Pasta"**

### Adicionar Músicas

1. Dentro da pasta, clique em **"Adicionar Música"**
2. Digite o título da música
3. Cole a URL do YouTube
4. Clique em **"Adicionar Música"**

### Baixar Playlist

1. Clique no botão **"Baixar Playlist"**
2. Aguarde o processamento
3. O ZIP será baixado automaticamente com esta estrutura:

```
Minha Playlist/
  ├── Openers/
  │   ├── Track 1.mp3
  │   └── Track 2.mp3
  ├── Peak Time/
  │   ├── Track 3.mp3
  │   └── Track 4.mp3
  └── Closing/
      └── Track 5.mp3
```

## 🎨 Design

Interface moderna com design card-based:

- **Playlists**: Cards grandes e escuros (slate)
- **Pastas**: Cards médios azuis
- **Músicas**: Cards compactos brancos
- **Animações**: Hover states e transições suaves
- **Responsivo**: Funciona em desktop e mobile

## 🔧 Instalação do yt-dlp

### Linux/macOS

```bash
# Via pip
python3 -m pip install -U yt-dlp

# Ou via curl
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### Windows

```bash
# Via winget
winget install yt-dlp
```

Verifique: `yt-dlp --version`

## 📂 Estrutura do Projeto

```
project/
├── app/
│   ├── actions/              # Server Actions (CRUD)
│   │   └── playlist-actions.ts
│   ├── api/                  # API Routes
│   │   └── playlists/[id]/download/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Página principal
├── components/               # Componentes React
│   ├── PlaylistCard.tsx
│   ├── FolderCard.tsx
│   ├── TrackCard.tsx
│   └── CreatePlaylistButton.tsx
├── lib/                      # Utilitários
│   ├── supabase.ts          # Cliente Supabase
│   └── download-utils.ts    # Funções de download
└── types/                    # Tipos TypeScript
    └── database.ts
```

## 🔄 Fluxo de Download

```
Usuário → POST /api/download → Buscar Dados → yt-dlp Download →
→ Organizar Pastas → Criar ZIP → Download → Limpeza
```

Veja mais detalhes em [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🗄️ Schema do Banco

```sql
playlists (id, name, created_at)
    ↓ 1:N
folders (id, name, playlist_id, created_at)
    ↓ 1:N
tracks (id, title, youtube_url, folder_id, created_at)
```

## ⚠️ Observações Importantes

- **Uso Pessoal**: Destinado para uso pessoal de DJs
- **Direitos Autorais**: Respeite os direitos autorais
- **Performance**: Download pode ser demorado com muitas músicas
- **Links Inválidos**: Músicas com links quebrados serão ignoradas

## 🐛 Problemas Comuns

### yt-dlp não encontrado

Instale o yt-dlp e verifique se está no PATH.

### Erro de conexão Supabase

Verifique as variáveis de ambiente no `.env.local`.

### Erro ao baixar do YouTube

- Verifique se a URL é válida
- Alguns vídeos têm restrições geográficas
- Verifique sua conexão com a internet

## 🚀 Deploy

### Vercel

```bash
# Instale a Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configure as variáveis de ambiente no dashboard da Vercel.

**Importante**: yt-dlp precisa estar disponível no ambiente de produção.

## 🤝 Contribuindo

Este é um projeto de uso pessoal, mas sugestões são bem-vindas!

## 📝 Licença

Este projeto é fornecido "como está" para uso pessoal.

## 💡 Créditos

- Interface inspirada em ferramentas modernas de DJ
- Ícones: Heroicons (via Tailwind)
- Download: yt-dlp

---

**Desenvolvido para DJs por DJs** 🎧

Para mais informações técnicas, consulte [ARCHITECTURE.md](./ARCHITECTURE.md)
