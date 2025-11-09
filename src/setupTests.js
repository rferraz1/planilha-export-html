import React, { useState } from 'react'; // Importa o useState
import './TreinoVisual.css';
// Não precisamos mais do lz-string aqui
// import lzString from 'lz-string';

// --- FUNÇÃO AUXILIAR PARA CONVERTER IMAGEM (BLOB) EM BASE64 ---
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result); // Retorna o data URL (data:image/...)
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// --- FUNÇÃO QUE GERA O HTML (AGORA ESPERA DADOS BASE64) ---
const gerarConteudoHTML = (listaComBase64, alunoNome, observacoes, logoBase64) => {
    // Agora o "lista" já contém as imagens em Base64
    const exerciciosHtml = listaComBase64.map(item => `
        <div class="exercicio-card">
            {/* USA O GIF EM BASE64 */}
            <img src="${item.gifBase64}" alt="${item.nome}" class="exercicio-gif" />
            <div>
                <p class="exercicio-nome">${item.nome}</p>
                <p class="exercicio-series">3 séries de 10 repetições</p>
            </div>
            ${item.variacao ? `<p class="exercicio-variacao">${item.variacao}</p>` : ''}
        </div>
    `).join('');

    const observacoesHtml = observacoes ? `
        <div class="observacoes-box">
            <strong>Observações:</strong>
            <p>${observacoes.replace(/\n/g, '<br>')}</p>
        </div>
    ` : '';
    
    // O CSS não muda
    const estilosCSS = `
        :root { --cor-verde: #28a745; --cor-fundo: #f4f7f6; --cor-branco: #ffffff; --cor-cinza-escuro: #333; --cor-cinza-medio: #6c757d; --cor-cinza-claro: #e9ecef; }
        body { font-family: 'Poppins', sans-serif; margin: 0; padding: 2rem; background-color: var(--cor-fundo); color: var(--cor-cinza-escuro); }
        .treino-folha { background: var(--cor-branco); max-width: 1000px; margin: 0 auto; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--cor-cinza-claro); padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .header-container .logo { max-width: 200px; }
        .header-container h2 { font-size: 2.2em; font-weight: 700; margin: 0; }
        .exercicios-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .exercicio-card { background: var(--cor-fundo); border: 1px solid var(--cor-cinza-claro); border-radius: 8px; padding: 1rem; text-align: center; display: flex; flex-direction: column; justify-content: space-between; min-height: 280px; }
        .exercicio-gif { width: 100%; border-radius: 6px; margin-bottom: 1rem; }
        .exercicio-nome { font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem; }
        .exercicio-series { font-size: 0.9rem; color: var(--cor-cinza-medio); }
        .exercicio-variacao { font-size: 0.9rem; font-weight: 500; color: var(--cor-verde); margin-top: 1rem; padding: 0.5rem; border-radius: 6px; background-color: #eaf6ec; word-wrap: break-word; }
        .observacoes-box { margin-top: 2rem; border-top: 2px solid var(--cor-cinza-claro); padding-top: 1.5rem; text-align: left; }
        .observacoes-box strong { font-size: 1.2rem; display: block; margin-bottom: 0.5rem; }
        .observacoes-box p { font-size: 1rem; line-height: 1.6; white-space: pre-wrap; }
    `;

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
            <title>Treino de ${alunoNome || 'Aluno(a)'}</title>
            <style>${estilosCSS}</style>
        </head>
        <body>
            <div class="treino-folha">
                <div class="header-container">
                    <h2>Treino de: ${alunoNome || "________________"}</h2>
                    {/* USA O LOGO EM BASE64 */}
                    <img src="${logoBase64}" alt="Logo" class="logo" />
                </div>
                <div class="exercicios-grid">${exerciciosHtml}</div>
                ${observacoesHtml}
            </div>
        </body>
        </html>
    `;
};


// --- O COMPONENTE PRINCIPAL ---
const TreinoVisual = ({ lista, alunoNome, observacoes, onClose, isReadOnly = false }) => {
    
    // Novo estado para controlar o carregamento do download
    const [estaBaixando, setEstaBaixando] = useState(false);

    // --- A NOVA FUNÇÃO DE EXPORTAR (AGORA É MÁGICA) ---
    const exportarParaHTML = async () => {
        setEstaBaixando(true); // Ativa o "Carregando..."
        alert('Preparando o download... Por favor, aguarde. Isso pode levar alguns segundos.');

        try {
            // 1. Buscar e converter o Logo
            const logoUrl = "https://planilharod.netlify.app/Rodolfo_Logo.png";
            const logoResponse = await fetch(logoUrl);
            const logoBlob = await logoResponse.blob();
            const logoBase64 = await blobToBase64(logoBlob);

            // 2. Buscar e converter TODOS os GIFs do treino
            const listaComBase64 = await Promise.all(
                lista.map(async (item) => {
                    const gifUrl = `https://chipper-churros-5621ed.netlify.app/gifs/${item.gif}`;
                    const gifResponse = await fetch(gifUrl);
                    const gifBlob = await gifResponse.blob();
                    const gifBase64 = await blobToBase64(gifBlob);
                    
                    // Retorna um novo objeto com o dado Base64
                    return {
                        ...item,
                        gifBase64: gifBase64 
                    };
                })
            );

            // 3. Gerar o HTML final com todo o conteúdo embutido
            const conteudoHtml = gerarConteudoHTML(listaComBase64, alunoNome, observacoes, logoBase64);
            
            // 4. Criar o Blob e disparar o download
            const blob = new Blob([conteudoHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `treino-${alunoNome || 'aluno'}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Erro ao gerar o HTML com Base64:", error);
            alert("Ocorreu um erro ao preparar o download. Tente novamente.");
        } finally {
            setEstaBaixando(false); // Desativa o "Carregando..."
        }
    };

    // A função de copiar link ainda existe, mas é secundária
    const copiarLinkDoTreino = () => {
        // ... (a lógica de ontem continua aqui, sem mudanças)
        const dadosDoTreino = {
            aluno: alunoNome,
            obs: observacoes,
            lista: lista
        };
        const jsonDoTreino = JSON.stringify(dadosDoTreino);
        const stringComprimida = lzString.compressToEncodedURIComponent(jsonDoTreino);
        const urlDoTreino = `https://planilharod.netlify.app/?treino=${stringComprimida}`;
        const mensagemParaCopiar = `Olá, ${alunoNome || 'Aluno(a)'}! 👋\n\nSegue o seu treino personalizado. Clique no link para visualizar:\n${urlDoTreino}`;
        navigator.clipboard.writeText(mensagemParaCopiar).then(() => {
            alert('Mensagem com o link do treino copiada para a área de transferência!');
        }).catch(err => {
            console.error('Falha ao copiar link: ', err);
            alert('Erro ao copiar o link.');
        });
    };

    // --- A PRÉ-VISUALIZAÇÃO (continua usando os links da web, para ser rápida) ---
    return (
        <div className="treino-visual-container">
            <div id="treino-para-exportar" className="treino-folha">
                <div className="header-container">
                    <h2>Treino de: {alunoNome || "________________"}</h2>
                    <img src="https://planilharod.netlify.app/Rodolfo_Logo.png" alt="Logo" className="logo" />
                </div>
                <div className="exercicios-grid">
                    {lista.map((item, index) => (
                        <div key={index} className="exercicio-card">
                            <img src={`https://chipper-churros-5621ed.netlify.app/gifs/${item.gif}`} alt={item.nome} className="exercicio-gif" />
                            <div>
                                <p className="exercicio-nome">{item.nome}</p>
                                <p className="exercicio-series">3 séries de 10 repetições</p>
                            </div>
                            {item.variacao && <p className="exercicio-variacao">{item.variacao}</p>}
                        </div>
                    ))}
                </div>
                {observacoes && (
                    <div className="observacoes-box">
                        <strong>Observações:</strong>
                        <p>{observacoes}</p>
                    </div>
                )}
            </div>

            {/* Os botões só aparecem se não for "Modo Leitura" */}
            {!isReadOnly && (
                <div className="botoes-acao">
                    {/* Botão de Download agora é o primário e mostra "Carregando..." */}
                    <button onClick={exportarParaHTML} className="botao-primario" disabled={estaBaixando}>
                        {estaBaixando ? "Preparando Download..." : "Baixar como HTML"}
                    </button>
                    {/* Botão de Copiar Link agora é secundário */}
                    <button onClick={copiarLinkDoTreino} className="botao-exportar" disabled={estaBaixando}>
                        Copiar Link do Treino
                    </button>
                    <button onClick={onClose} className="botao-fechar" disabled={estaBaixando}>
                        Fechar
                    </button>
                </div>
            )}
        </div>
    );
};

export default TreinoVisual;