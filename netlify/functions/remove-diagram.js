// Netlify Function: remove-diagram.js
// Remove diagrama do configuration.json.js e deleta SVG

const { Octokit } = require('@octokit/rest');

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
        const { diagramId } = JSON.parse(event.body);
        
        if (!diagramId) {
            throw new Error('diagramId é obrigatório');
        }

        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            throw new Error('GITHUB_TOKEN não configurado');
        }

        const octokit = new Octokit({ auth: githubToken });
        const owner = 'charlieloganx23';
        const repo = 'fluxobizagi';
        const branch = 'main';

        // 1. Busca o SHA do último commit
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
        let jsonString = configContent.replace(/^Bizagi\.AppModel\s*=\s*/, '').trim();
        
        // Fallback: Se ainda começar com "Bizagi", remover manualmente
        if (jsonString.startsWith('Bizagi')) {
            jsonString = jsonString.substring(jsonString.indexOf('{'));
        }
        
        const config = JSON.parse(jsonString);

        // 4. Encontra o diagrama a remover
        const diagramIndex = config.pages.findIndex(p => p.id === diagramId);
        if (diagramIndex === -1) {
            throw new Error('Diagrama não encontrado');
        }

        const diagram = config.pages[diagramIndex];
        const diagramName = diagram.name;
        const svgFileName = diagram.image.split('/').pop();

        // 5. Remove o diagrama
        config.pages.splice(diagramIndex, 1);

        // 6. Remove referências de subprocesso nos processos pai
        config.pages.forEach(page => {
            if (page.subPages && page.subPages.includes(diagramId)) {
                page.subPages = page.subPages.filter(id => id !== diagramId);
            }
        });

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

        // 9. Busca SHAs dos arquivos SVG para deletar
        const svgPaths = [
            `public/files/diagrams/${svgFileName}`,
            `Tentar publicar/files/diagrams/${svgFileName}`
        ];

        const deletePromises = svgPaths.map(async (path) => {
            try {
                const { data: fileData } = await octokit.repos.getContent({
                    owner,
                    repo,
                    path,
                    ref: branch
                });
                return { path, sha: fileData.sha };
            } catch (error) {
                console.warn(`Arquivo não encontrado: ${path}`);
                return null;
            }
        });

        const filesToDelete = (await Promise.all(deletePromises)).filter(f => f !== null);

        // 10. Cria nova árvore
        const tree = [
            // Atualiza configuration.json.js em ambas as pastas
            {
                path: 'public/libs/js/json/configuration.json.js',
                mode: '100644',
                type: 'blob',
                content: newConfigContent
            },
            {
                path: configPath,
                mode: '100644',
                type: 'blob',
                content: newConfigContent
            },
            // Marca arquivos SVG para deleção (sha: null)
            ...filesToDelete.map(file => ({
                path: file.path,
                mode: '100644',
                type: 'blob',
                sha: null  // Isso marca o arquivo para deleção
            }))
        ];

        const { data: newTree } = await octokit.git.createTree({
            owner,
            repo,
            base_tree: baseTreeSha,
            tree
        });

        // 11. Cria novo commit
        const commitMessage = `Remove: Diagrama "${diagramName}" via interface web admin`;
        const { data: newCommit } = await octokit.git.createCommit({
            owner,
            repo,
            message: commitMessage,
            tree: newTree.sha,
            parents: [latestCommitSha]
        });

        // 12. Atualiza a referência da branch
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
                message: `Diagrama "${diagramName}" removido com sucesso!`,
                commitSha: newCommit.sha
            })
        };

    } catch (error) {
        console.error('Erro ao remover diagrama:', error);
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
