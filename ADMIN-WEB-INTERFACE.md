# 🌐 Interface Web de Administração

## 📋 O que é?

Interface web para gerenciar diagramas Bizagi **diretamente pelo navegador**, usando **Netlify Functions** (serverless) para fazer commits automáticos no GitHub.

## ✨ Funcionalidades

- ✅ **Adicionar Diagramas** - Upload de SVG via drag-and-drop
- ✅ **Listar Diagramas** - Visualizar todos os processos publicados
- ✅ **Remover Diagramas** - Deletar diagramas obsoletos
- ✅ **Subprocessos** - Criar e vincular subprocessos a processos pai
- ✅ **Commits Automáticos** - Mudanças vão direto para o GitHub
- ✅ **Deploy Automático** - Netlify atualiza o site automaticamente

## 🚀 Como Acessar

Após configurado, acesse:
```
https://repositorioprocessos.netlify.app/admin
```

## ⚙️ Configuração (Necessária!)

### 1️⃣ Criar GitHub Personal Access Token

1. Acesse: https://github.com/settings/tokens/new
2. Dê um nome: `Netlify Admin Interface`
3. Expiration: `No expiration` ou `90 days`
4. Selecione as permissões:
   - ✅ **repo** (Full control of private repositories)
5. Clique em **Generate token**
6. **COPIE O TOKEN** (não será mostrado novamente!)

### 2️⃣ Configurar Variáveis de Ambiente no Netlify

1. Acesse: https://app.netlify.com/sites/repositorioprocessos/settings/deploys#environment
2. Clique em **Add variable**
3. Adicione:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: Cole o token criado no passo 1
4. Clique em **Save**

### 3️⃣ Fazer Deploy

Commit e push desta branch:
```bash
git add .
git commit -m "Add: Interface web de administração com Netlify Functions"
git push
```

O Netlify vai automaticamente:
- Detectar as Netlify Functions
- Instalar dependências (package.json)
- Fazer deploy da interface admin

### 4️⃣ Testar

Acesse `/admin` e teste a funcionalidade!

## 🔐 Segurança

### Senha Temporária

A interface usa uma senha simples no frontend (temporária):
- **Senha padrão**: `admin123`
- ⚠️ **INSEGURO** para produção!

### Para Produção (Recomendado)

Use **Netlify Identity** para autenticação real:
1. Ative Identity no Netlify: https://app.netlify.com/sites/repositorioprocessos/settings/identity
2. Modifique `admin.js` para usar Netlify Identity
3. Adicione role-based access control

Ou use autenticação via GitHub OAuth.

## 📁 Estrutura de Arquivos

```
lumafluxo/
├── netlify/
│   └── functions/           # Serverless functions
│       ├── get-diagrams.js  # Lista diagramas
│       ├── add-diagram.js   # Adiciona diagrama + commit
│       └── remove-diagram.js # Remove diagrama + commit
├── Tentar publicar/
│   └── admin/
│       ├── index.html       # Interface web
│       ├── admin.css        # Estilos
│       └── admin.js         # Lógica frontend
├── netlify.toml             # Configuração Netlify
├── package.json             # Dependências Node.js
└── .env.example             # Template de variáveis
```

## 🛠️ Desenvolvimento Local

### 1. Instalar dependências:
```bash
npm install
```

### 2. Criar arquivo `.env`:
```bash
cp .env.example .env
# Edite .env e adicione seu GITHUB_TOKEN
```

### 3. Rodar Netlify Dev:
```bash
netlify dev
# ou
npm run dev
```

Acesse: http://localhost:8888/admin

## 🧪 Como Funciona

### Fluxo de Adicionar Diagrama:

1. **Frontend** (admin.html/js):
   - Usuário faz upload do SVG
   - Preenche nome, tipo (macro/sub), autor
   - Clica em "Adicionar"

2. **Netlify Function** (add-diagram.js):
   - Recebe dados do frontend
   - Usa Octokit (GitHub API) para:
     - Buscar configuration.json.js atual
     - Adicionar novo diagrama ao JSON
     - Fazer upload do SVG (2 cópias: public/ e Tentar publicar/)
     - Atualizar configuration.json.js (2 cópias)
     - Criar commit no GitHub

3. **GitHub + Netlify**:
   - GitHub recebe o commit
   - Netlify detecta push
   - Deploy automático em ~2 minutos

4. **Resultado**:
   - Diagrama aparece no site!

## 📊 API Endpoints

### GET `/api/get-diagrams`
Retorna lista de diagramas.

**Response:**
```json
{
  "success": true,
  "diagrams": [ /* array de diagramas */ ],
  "totalDiagrams": 7,
  "publishDate": "06/03/2026 15:30:00"
}
```

### POST `/api/add-diagram`
Adiciona novo diagrama.

**Request Body:**
```json
{
  "fileName": "meu-diagrama.svg",
  "fileContent": "base64_encoded_svg",
  "name": "Nome do Diagrama",
  "isSubprocess": false,
  "parentId": null,
  "author": "Usuário"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagrama adicionado com sucesso!",
  "diagramId": "uuid-do-diagrama",
  "commitSha": "abc123..."
}
```

### POST `/api/remove-diagram`
Remove diagrama.

**Request Body:**
```json
{
  "diagramId": "uuid-do-diagrama"
}
```

## ❓ Troubleshooting

### Erro: "GITHUB_TOKEN não configurado"
- Certifique-se de adicionar o token nas variáveis de ambiente do Netlify
- Refaça o deploy após adicionar

### Erro: "403 Forbidden" ou "Bad credentials"
- Token do GitHub pode estar expirado ou com permissões insuficientes
- Gere um novo token com permissões de `repo`

### Interface admin não carrega
- Verifique se o redirect está configurado no `netlify.toml`
- Force um novo deploy

### Diagrama adicionado mas não aparece no site
- Aguarde 2-3 minutos para o deploy completar
- Limpe o cache do navegador (Ctrl + Shift + R)
- Verifique se houve erro no deploy: https://app.netlify.com/sites/repositorioprocessos/deploys

## 🎯 Próximos Passos

- [ ] Implementar Netlify Identity para autenticação segura
- [ ] Adicionar validação de tamanho de arquivo (max 5MB)
- [ ] Preview de SVG antes de upload
- [ ] Editar diagramas existentes (renomear, trocar arquivo)
- [ ] Visualizar histórico de commits
- [ ] Rollback para versões anteriores

## 📝 Comparação com Scripts PowerShell

| Recurso | Scripts PowerShell | Interface Web |
|---------|-------------------|---------------|
| **Onde funciona** | Só no seu PC | Qualquer navegador |
| **Autenticação** | Git local | Senha + Token GitHub |
| **Upload** | Seleção de pasta | Drag-and-drop |
| **Visual** | Terminal | Interface gráfica |
| **Deploy** | Manual (git push) | Automático |
| **Segurança** | ✅ Total | ⚠️ Requer configuração |
| **Complexidade** | Baixa | Média |

Ambos são válidos! Use o que preferir. 🚀
