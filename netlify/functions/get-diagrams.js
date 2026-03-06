// Netlify Function: get-diagrams.js
// Retorna a lista de diagramas do configuration.json.js

const fs = require('fs');
const path = require('path');

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
        // Caminho para o arquivo configuration.json.js no deploy
        const configPath = path.join(process.cwd(), 'Tentar publicar', 'libs', 'js', 'json', 'configuration.json.js');
        
        // Lê o arquivo localmente
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        console.log('Primeiros 50 caracteres:', configContent.substring(0, 50));
        
        // Remove o prefixo "Bizagi.AppModel = " e converte para JSON
        let jsonString = configContent.replace(/^Bizagi\.AppModel\s*=\s*/, '').trim();
        
        // Se ainda começar com caracteres não-JSON, tente remover manualmente
        if (jsonString.startsWith('Bizagi')) {
            jsonString = jsonString.substring(jsonString.indexOf('{'));
        }
        
        console.log('Primeiros 50 caracteres após replace:', jsonString.substring(0, 50));
        
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
