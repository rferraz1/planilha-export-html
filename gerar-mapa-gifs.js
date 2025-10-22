// gerar-mapa-gifs.js (VERSÃO INFALÍVEL)
const fs = require('fs');
const path = require('path');

const gifsDirectory = path.join(__dirname, 'public', 'gifs');
const outputFile = path.join(__dirname, 'public', 'gifs.json');

const finalStructure = {};
let totalGifsFound = 0;

function findGifsRecursively(currentDirectory) {
    try {
        const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDirectory, entry.name);
            if (entry.isDirectory()) {
                findGifsRecursively(fullPath);
            } else if (path.extname(entry.name).toLowerCase() === '.gif') {
                totalGifsFound++;
                const relativePath = path.relative(gifsDirectory, fullPath).replace(/\\/g, '/');
                const allKeywordsText = relativePath.replace('.gif', '').toLowerCase();
                const keywords = allKeywordsText.split(/[\s\/-_]+/);
                keywords.forEach(keyword => {
                    if (keyword) {
                        if (!finalStructure[keyword]) finalStructure[keyword] = [];
                        if (!finalStructure[keyword].includes(relativePath)) {
                            finalStructure[keyword].push(relativePath);
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error(`❌ Erro Crítico ao ler o diretório: ${currentDirectory}`, error);
    }
}

console.log('🤖 Mapeando a estrutura de GIFs com o assistente final...');
if (!fs.existsSync(gifsDirectory)) {
    console.error(`❌ ERRO CRÍTICO: A pasta 'public/gifs' não foi encontrada.`);
} else {
    findGifsRecursively(gifsDirectory);
    fs.writeFileSync(outputFile, JSON.stringify(finalStructure, null, 2));
    console.log(`✅ Mapa-mestre final criado com sucesso com ${totalGifsFound} exercícios!`);
}