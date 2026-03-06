// Netlify Function: get-diagrams.js
// Retorna a lista de diagramas do configuration.json.js

const https = require('https');

exports.handler = async (event, context) => {
    // Configuração CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // URL do configuration.json.js no GitHub (raw)
        const configUrl = 'https://raw.githubusercontent.com/charlieloganx23/fluxobizagi/main/Tentar%20publicar/libs/js/json/configuration.json.js';
        
        // Busca o arquivo
        const configContent = await fetchFromGitHub(configUrl);
        
        // Remove o prefixo "Bizagi.AppModel = " e converte para JSON
        const jsonString = configContent.replace(/^Bizagi\.AppModel\s*=\s*/, '').trim();
        const config = JSON.parse(jsonString);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                diagrams: config.pages || [],
                totalDiagrams: (config.pages || []).length,
                publishDate: config.publishDate
            })
        };
    } catch (error) {
        console.error('Erro ao buscar diagramas:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

// Helper para fazer requisição HTTPS
function fetchFromGitHub(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`GitHub retornou status ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}
