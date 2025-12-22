# DJ Set Manager - Guia de Configuração

## 📋 Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Conta Supabase** - [Criar conta gratuita](https://supabase.com)
3. **yt-dlp** instalado no servidor - [Instruções de instalação](https://github.com/yt-dlp/yt-dlp#installation)

## 🚀 Configuração Passo a Passo

### 1. Configurar o Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto ou use um existente
3. Vá em **Project Settings > API**
4. Copie as seguintes informações:
   - **URL** (Project URL)
   - **anon/public key** (API Key)

### 2. Configurar Variáveis de Ambiente

1. Renomeie o arquivo `.env.local` ou crie um novo com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

2. Substitua `sua_url_aqui` e `sua_chave_anon_aqui` pelos valores copiados do Supabase

### 3. Verificar Schema do Banco de Dados

O schema já foi criado automaticamente no Supabase com as seguintes tabelas:

- ✅ **playlists** - Armazena as playlists
- ✅ **folders** - Armazena as pastas dentro das playlists
- ✅ **tracks** - Armazena as músicas (links do YouTube)

Você pode verificar em **Database > Tables** no Supabase Dashboard.

### 4. Instalar Dependências

```bash
npm install
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 6. Build para Produção

```bash
npm run build
npm start
```

## 🎵 Como Usar

### Criar uma Playlist

1. Clique no botão **"Nova Playlist"**
2. Digite o nome da playlist
3. Clique em **"Criar"**

### Adicionar Pastas

1. Dentro de uma playlist, clique em **"Adicionar Pasta"**
2. Digite o nome da pasta (ex: "House", "Techno", "Remixes")
3. Clique em **"Criar Pasta"**

### Adicionar Músicas

1. Dentro de uma pasta, clique em **"Adicionar Música"**
2. Digite o título da música
3. Cole a URL do YouTube
4. Clique em **"Adicionar Música"**

### Baixar Playlist

1. Clique no botão **"Baixar Playlist"** no card da playlist
2. Aguarde o processamento (pode levar alguns minutos)
3. O arquivo ZIP será baixado automaticamente

**Estrutura do ZIP:**
```
Nome da Playlist/
  ├── Nome da Pasta 1/
  │   ├── Música 1.mp3
  │   ├── Música 2.mp3
  │   └── ...
  ├── Nome da Pasta 2/
  │   ├── Música 3.mp3
  │   └── ...
  └── ...
```

## 🔧 Instalação do yt-dlp

O yt-dlp é necessário para baixar as músicas do YouTube.

### Linux/macOS

```bash
# Via pip
python3 -m pip install -U yt-dlp

# Via curl
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### Windows

```bash
# Via winget
winget install yt-dlp

# Ou baixe o executável
# https://github.com/yt-dlp/yt-dlp/releases
```

### Verificar Instalação

```bash
yt-dlp --version
```

## ⚠️ Observações Importantes

1. **Uso Pessoal**: Este aplicativo é destinado ao uso pessoal de DJs
2. **Direitos Autorais**: Respeite os direitos autorais ao baixar músicas
3. **Links Inválidos**: Músicas com links quebrados ou privados serão ignoradas no download
4. **Tempo de Download**: O download pode ser demorado dependendo do número de músicas

## 🐛 Problemas Comuns

### "yt-dlp não encontrado"

Certifique-se de que o yt-dlp está instalado e acessível no PATH do sistema.

### "Erro ao baixar áudio do YouTube"

- Verifique se a URL é válida
- Verifique sua conexão com a internet
- Alguns vídeos podem ter restrições geográficas

### Erro na conexão com Supabase

- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique as políticas RLS (devem permitir acesso público)

## 📚 Tecnologias Utilizadas

- **Next.js 13** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + RLS)
- **yt-dlp** (Download de áudio)

## 📝 Estrutura do Projeto

```
project/
├── app/
│   ├── actions/          # Server Actions
│   ├── api/              # API Routes
│   ├── globals.css       # Estilos globais
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página inicial
├── components/           # Componentes React
│   ├── PlaylistCard.tsx
│   ├── FolderCard.tsx
│   ├── TrackCard.tsx
│   └── CreatePlaylistButton.tsx
├── lib/                  # Utilitários
│   ├── supabase.ts       # Cliente Supabase
│   └── download-utils.ts # Funções de download
└── types/                # Tipos TypeScript
    └── database.ts       # Tipos do banco de dados
```

## 💡 Dicas de Uso

1. **Organize por Estilos**: Crie pastas por gênero musical
2. **Nomes Descritivos**: Use nomes claros para playlists e pastas
3. **Teste Links**: Certifique-se de que os links do YouTube funcionam
4. **Backup Regular**: Baixe suas playlists regularmente

## 🎯 Fluxo de Download

1. **Usuário** clica em "Baixar Playlist"
2. **Frontend** envia requisição POST para `/api/playlists/[id]/download`
3. **Backend** busca dados do Supabase
4. **yt-dlp** baixa e converte áudios para MP3
5. **Sistema** organiza em pastas
6. **Archiver** cria arquivo ZIP
7. **Frontend** recebe e baixa o ZIP

---

**Desenvolvido para DJs por DJs** 🎧
