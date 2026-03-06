// Netlify Function: add-diagram.js
// Adiciona novo diagrama: upload SVG + atualiza config + commit no GitHub

const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: 'Método não permitido' })
        };
    }

    try {
        const { fileName, fileContent, name, isSubprocess, parentId, author } = JSON.parse(event.body);
        
        // Validação
        if (!fileName || !fileContent || !name) {
            throw new Error('Dados incompletos: fileName, fileContent e name são obrigatórios');
        }

        // Token do GitHub (variável de ambiente do Netlify)
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            throw new Error('GITHUB_TOKEN não configurado nas variáveis de ambiente do Netlify');
        }

        // Inicializa Octokit
        const octokit = new Octokit({ auth: githubToken });
        const owner = 'charlieloganx23';
        const repo = 'fluxobizagi';
        const branch = 'main';

        // 1. Busca o SHA do último commit da branch
        const { data: refData } = await octokit.git.getRef({
            owner,
            repo,
            ref: `heads/${branch}`
        });
        const latestCommitSha = refData.object.sha;

        // 2. Busca a árvore do commit
        const { data: commitData } = await octokit.git.getCommit({
            owner,
            repo,
            commit_sha: latestCommitSha
        });
        const baseTreeSha = commitData.tree.sha;

        // 3. Busca o configuration.json.js atual
        const configPath = 'Tentar publicar/libs/js/json/configuration.json.js';
        const { data: configFile } = await octokit.repos.getContent({
            owner,
            repo,
            path: configPath,
            ref: branch
        });
        
        const configContent = Buffer.from(configFile.content, 'base64').toString('utf8');
        const jsonString = configContent.replace(/^Bizagi\.AppModel\s*=\s*/, '').trim();
        const config = JSON.parse(jsonString);

        // 4. Cria novo diagrama
        const newDiagram = {
            id: crypto.randomUUID(),
            name: name,
            version: '1.0',
            author: author || 'Usuário',
            image: `files/diagrams/${fileName}`,
            isSubprocessPage: isSubprocess || false,
            isCallActivityPage: false,
            elements: [],
            subPages: []
        };

        // 5. Adiciona ao config
        config.pages.push(newDiagram);

        // 6. Se é subprocesso, adiciona ao processo pai
        if (isSubprocess && parentId) {
            const parentProcess = config.pages.find(p => p.id === parentId);
            if (parentProcess) {
                if (!parentProcess.subPages) {
                    parentProcess.subPages = [];
                }
                parentProcess.subPages.push(newDiagram.id);
            }
        }

        // 7. Atualiza publishDate
        config.publishDate = new Date().toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // 8. Converte de volta para o formato Bizagi
        const newConfigContent = `Bizagi.AppModel = ${JSON.stringify(config)}`;

        // 9. Cria nova árvore com os arquivos
        const tree = [
            // SVG em public/files/diagrams/
            {
                path: `public/files/diagrams/${fileName}`,
                mode: '100644',
                type: 'blob',
                content: Buffer.from(fileContent, 'base64').toString('utf8')
            },
            // SVG em Tentar publicar/files/diagrams/
            {
                path: `Tentar publicar/files/diagrams/${fileName}`,
                mode: '100644',
                type: 'blob',
                content: Buffer.from(fileContent, 'base64').toString('utf8')
            },
            // configuration.json.js em public/
            {
                path: 'public/libs/js/json/configuration.json.js',
                mode: '100644',
                type: 'blob',
                content: newConfigContent
            },
            // configuration.json.js em Tentar publicar/
            {
                path: configPath,
                mode: '100644',
                type: 'blob',
                content: newConfigContent
            }
        ];

        const { data: newTree } = await octokit.git.createTree({
            owner,
            repo,
            base_tree: baseTreeSha,
            tree
        });

        // 10. Cria novo commit
        const commitMessage = `Add: Novo diagrama "${name}" via interface web admin`;
        const { data: newCommit } = await octokit.git.createCommit({
            owner,
            repo,
            message: commitMessage,
            tree: newTree.sha,
            parents: [latestCommitSha]
        });

        // 11. Atualiza a referência da branch
        await octokit.git.updateRef({
            owner,
            repo,
            ref: `heads/${branch}`,
            sha: newCommit.sha
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `Diagrama "${name}" adicionado com sucesso!`,
                diagramId: newDiagram.id,
                commitSha: newCommit.sha
            })
        };

    } catch (error) {
        console.error('Erro ao adicionar diagrama:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                details: error.stack
            })
        };
    }
};
