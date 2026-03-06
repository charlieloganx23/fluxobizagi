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
        // Determina a URL base do site (funciona tanto local quanto em produção)
        const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:8888';
        const configUrl = `${siteUrl}/libs/js/json/configuration.json.js`;
        
        console.log('Buscando configuração de:', configUrl);
        
        // Busca o arquivo do próprio site publicado
        const configContent = await fetchUrl(configUrl);
        
        // Remove o prefixo "Bizagi.AppModel = " e converte para JSON
        let jsonString = configContent.replace(/^Bizagi\.AppModel\s*=\s*/, '').trim();
        
        // Se ainda começar com caracteres não-JSON, tente remover manualmente
        if (jsonString.startsWith('Bizagi')) {
            jsonString = jsonString.substring(jsonString.indexOf('{'));
        }
        
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

// Helper para fazer requisição HTTP/HTTPS
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : require('http');
        protocol.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`Servidor retornou status ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}
