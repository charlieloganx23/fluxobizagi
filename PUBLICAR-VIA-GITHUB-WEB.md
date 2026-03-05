# 🌐 Como Adicionar Diagramas pelo GitHub Web

## � Escolha Seu Editor

O GitHub oferece **3 formas** de editar arquivos online:

### 1. **GitHub Web Tradicional** (Mais Simples)
- ✅ Interface básica de upload e edição
- ✅ Funciona em qualquer navegador
- ✅ Ideal para adicionar 1-2 diagramas
- 📍 **Use esta seção:** Siga o "Passo a Passo Rápido" abaixo

### 2. **github.dev** (Editor VSCode Online)
- ✅ Editor completo tipo VSCode no navegador
- ✅ Ambiente Linux com terminal bash
- ✅ Gratuito e instantâneo
- ⚠️ Limitação: Commit via interface (não pode executar `git push` no terminal)
- 📍 **Como acessar:** Pressione `.` (ponto) enquanto estiver no repositório
- 📍 **Ou acesse:** https://github.dev/charlieloganx23/fluxobizagi
- 💡 **Melhor para:** Editar múltiplos arquivos de uma vez

### 3. **GitHub Codespaces** (Ambiente Linux Completo)
- ✅ VSCode completo na nuvem
- ✅ Terminal bash funcional com git
- ✅ Pode rodar scripts e instalar ferramentas
- 💰 60 horas grátis por mês (depois paga)
- 📍 **Como criar:** Botão verde "Code" → aba "Codespaces" → "Create codespace"
- 💡 **Melhor para:** Trabalhos complexos ou usar scripts bash

---

## �📋 Passo a Passo Rápido

### PASSO 1: Fazer Upload dos Arquivos SVG

1. **Acesse seu repositório:**
   - Vá para: https://github.com/charlieloganx23/fluxobizagi

2. **Navegue até a pasta dos diagramas:**
   - Clique em `Tentar publicar` → `files` → `diagrams`
   - URL direta: https://github.com/charlieloganx23/fluxobizagi/tree/main/Tentar%20publicar/files/diagrams

3. **Adicione os arquivos SVG:**
   - Clique no botão **"Add file"** (canto superior direito)
   - Selecione **"Upload files"**
   - Arraste seus arquivos `.svg` OU clique em "choose your files"
   - Role até o final da página
   - Em "Commit changes":
     - Escreva: `Add: Novo diagrama [Nome do Diagrama]`
   - Clique em **"Commit changes"** (botão verde)

---

### PASSO 2: Atualizar o Arquivo de Configuração

1. **Abra o arquivo de configuração:**
   - Volte para a raiz do repositório
   - Navegue: `Tentar publicar` → `libs` → `js` → `json`
   - Clique em **`configuration.json.js`**
   - URL direta: https://github.com/charlieloganx23/fluxobizagi/blob/main/Tentar%20publicar/libs/js/json/configuration.json.js

2. **Edite o arquivo:**
   - Clique no ícone de **lápis** (✏️) no canto superior direito
   - Você verá uma linha longa de JSON começando com: `Bizagi.AppModel = {...`

3. **Localize a seção "pages":**
   - Procure por: `"pages":[`
   - Você verá uma lista de diagramas existentes

4. **Adicione o novo diagrama:**
   - Vá até o ÚLTIMO diagrama da lista (antes do `],"texts":{`)
   - Adicione uma **vírgula** após a última chave `}`
   - Cole o seguinte código (adapte os valores):

   ```json
   ,{"id":"XXXXX-NOVO-ID-XXXXX","name":"Nome do Seu Diagrama","version":"1.0","author":"Usuario","image":"files/diagrams/SeuArquivo.svg","isSubprocessPage":false,"isCallActivityPage":false,"elements":[],"subPages":[]}
   ```

   **⚠️ IMPORTANTE:**
   - Gere um ID único mudando alguns números. Exemplo: `"cc5fe777-8888-4b3d-becd-74e37acb5099"`
   - Troque `"Nome do Seu Diagrama"` pelo nome que aparecerá no site
   - Troque `SeuArquivo.svg` pelo nome EXATO do arquivo que você enviou
   - **NÃO esqueça a vírgula antes do `{`**

5. **Exemplo completo:**
   ```json
   "pages":[
     {"id":"aa1fe458-7272-4a2d-becd-74e37acb504f","name":"Acompanhamento trimestral",...},
     {"id":"bb2fe458-7272-4a2d-becd-74e37acb5050","name":"Resposta e processamento",...},
     {"id":"cc5fe458-7272-4a2d-becd-74e37acb5051","name":"Inspeção",...}
     ,{"id":"ee6fe459-9999-5c4e-dfgh-85f48bdc6102","name":"Meu Novo Diagrama","version":"1.0","author":"Usuario","image":"files/diagrams/NovoFluxo.svg","isSubprocessPage":false,"isCallActivityPage":false,"elements":[],"subPages":[]}
   ],"texts":{...
   ```

6. **Salvar as alterações:**
   - Role até o final da página
   - Em "Commit changes":
     - Escreva: `Update: Adiciona novo diagrama no configuration.json.js`
   - Clique em **"Commit changes"** (botão verde)

---

### PASSO 3: Aguardar o Deploy Automático

1. **O Netlify inicia automaticamente:**
   - Aguarde 1-2 minutos
   - O site será atualizado em: https://repositorioprocessos.netlify.app

2. **Verifique o resultado:**
   - Acesse o site
   - Pressione `Ctrl + Shift + R` (hard refresh)
   - O novo diagrama deve aparecer na barra lateral!

---

## ✅ Checklist Rápido

- [ ] Arquivo SVG enviado para `Tentar publicar/files/diagrams/`
- [ ] Nome do arquivo SVG anotado (será usado no configuration.json.js)
- [ ] Editado `configuration.json.js` adicionando nova entrada em "pages"
- [ ] ID único gerado para o novo diagrama
- [ ] Vírgula adicionada antes do novo objeto JSON
- [ ] Nome do arquivo no "image" corresponde ao SVG enviado
- [ ] Commit feito com mensagem descritiva
- [ ] Aguardados 1-2 minutos para deploy
- [ ] Testado no site com Ctrl+Shift+R

---

## 🚨 Erros Comuns

### ❌ "Página não carrega" ou tela branca
**Causa:** Erro de sintaxe no JSON (provavelmente vírgula faltando ou sobrando)
**Solução:** 
1. Volte ao arquivo `configuration.json.js` no GitHub
2. Clique em "History" para ver versões anteriores
3. Clique em "Revert" no último commit
4. Tente novamente com mais atenção à sintaxe

### ❌ Diagrama não aparece na barra lateral
**Causa:** Nome do arquivo no "image" diferente do SVG enviado
**Solução:** 
- Verifique se o nome em `"image":"files/diagrams/ARQUIVO.svg"` está EXATAMENTE igual ao nome do arquivo enviado
- Lembre-se: maiúsculas/minúsculas importam!

### ❌ Arquivo muito grande (GitHub rejeita)
**Causa:** SVG maior que 25 MB
**Solução:** Use os scripts locais OU otimize o SVG

---

## �️ Método Alternativo: github.dev (Editor VSCode Online)

### Por que usar o github.dev?
- ✅ Interface profissional tipo VSCode
- ✅ Editar múltiplos arquivos simultaneamente
- ✅ Preview do JSON formatado
- ✅ Terminal bash integrado
- ✅ 100% gratuito, sem limites

### Como usar:

**1. Abrir o editor:**
- No repositório, pressione a tecla `.` (ponto)
- **Ou acesse:** https://github.dev/charlieloganx23/fluxobizagi

**2. Fazer upload dos SVGs:**
- No painel esquerdo (Explorer), navegue até: `Tentar publicar/files/diagrams/`
- Clique com botão direito na pasta `diagrams`
- Selecione **"Upload..."**
- Escolha seus arquivos SVG

**3. Editar configuration.json.js:**
- Abra o arquivo: `Tentar publicar/libs/js/json/configuration.json.js`
- Adicione as novas entradas em `"pages":[...]`
- O editor mostra erros de sintaxe em tempo real!

**4. Gerar UUID (opcional - via terminal):**
```bash
# Abra o terminal (Ctrl + `)
uuidgen  # Gera um ID único
```

**5. Commitar e enviar:**
- Clique no ícone **Source Control** (3º botão à esquerda)
- Revise as mudanças
- Digite a mensagem: `Add: Novos diagramas`
- Clique em **"Commit & Push"**

### Vantagem sobre GitHub Web tradicional:
- ✅ Vê todos os arquivos modificados de uma vez
- ✅ Preview de sintaxe JSON colorida
- ✅ Autocomplete e validação
- ✅ Desfazer múltiplas mudanças facilmente

---

## �💡 Vantagens vs. Scripts Locais

| Método | Vantagens | Desvantagens |
|--------|-----------|--------------|
| **GitHub Web** | ✅ Funciona de qualquer computador<br>✅ Não precisa instalar nada<br>✅ Fácil reverter erros | ❌ Mais manual<br>❌ Risco de erro de sintaxe JSON<br>❌ Interface básica |
| **github.dev** | ✅ Editor profissional VSCode<br>✅ Validação de sintaxe em tempo real<br>✅ Terminal bash integrado<br>✅ Gratuito ilimitado | ❌ Git push só via interface<br>❌ Requer navegador moderno |
| **Codespaces** | ✅ Ambiente Linux completo<br>✅ Terminal bash full com git<br>✅ Pode rodar scripts complexos | 💰 Apenas 60h grátis/mês<br>❌ Leva ~30s para iniciar |
| **Scripts Locais** | ✅ Totalmente automático<br>✅ Valida JSON<br>✅ Impossível quebrar<br>✅ Gratuito ilimitado | ❌ Só funciona no seu computador<br>❌ Precisa configurar PowerShell |

---

## 📝 Template para Copiar e Colar

Quando for adicionar novo diagrama, copie esta linha e substitua os valores:

```json
,{"id":"GERE-ID-UNICO-AQUI","name":"Nome Amigavel do Diagrama","version":"1.0","author":"Usuario","image":"files/diagrams/NomeDoArquivo.svg","isSubprocessPage":false,"isCallActivityPage":false,"elements":[],"subPages":[]}
```

**Geradores de ID online:**
- https://www.uuidgenerator.net/
- Ou mude alguns dígitos de um ID existente

---

## 🎯 Exemplo Prático Completo

**Cenário:** Você quer adicionar um diagrama chamado "Atendimento de Urgência" do arquivo `urgencia.svg`

**PASSO 1:** Upload do `urgencia.svg` para `Tentar publicar/files/diagrams/`

**PASSO 2:** Editar `configuration.json.js`, localizar o final da lista "pages" e adicionar:

```json
,{"id":"ff7fe460-1111-6d5f-ghij-96g59cef7203","name":"Atendimento de Urgência","version":"1.0","author":"Usuario","image":"files/diagrams/urgencia.svg","isSubprocessPage":false,"isCallActivityPage":false,"elements":[],"subPages":[]}
```

**PASSO 3:** Commit e aguardar 1-2 minutos

**Pronto!** O diagrama "Atendimento de Urgência" aparecerá no site! 🎉

---

## 🔗 Links Rápidos

- 📦 **Repositório:** https://github.com/charlieloganx23/fluxobizagi
- 📁 **Pasta diagrams:** https://github.com/charlieloganx23/fluxobizagi/tree/main/Tentar%20publicar/files/diagrams
- ⚙️ **Configuration.json.js:** https://github.com/charlieloganx23/fluxobizagi/blob/main/Tentar%20publicar/libs/js/json/configuration.json.js
- 🌐 **Site publicado:** https://repositorioprocessos.netlify.app

---

**💡 Dica:** Prefira usar os scripts locais quando possível - são mais seguros e automáticos. Use o GitHub Web quando estiver em outro computador ou precisar fazer uma correção rápida!
