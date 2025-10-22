// src/TreinoVisual.js (VERSÃO FINAL SEM LOGO NO MODAL)
import React, { useRef, useState } from 'react';
import './TreinoVisual.css';

const LOGO_FILENAME = 'Rodolfo_Logo.png'; 

const TreinoVisual = ({ lista, alunoNome, observacoes, onClose, isModoVisualizacao, codificarDados }) => {
    const treinoRef = useRef();
    const [textoBotao, setTextoBotao] = useState('Exportar Planilha Animada');

    const toBase64 = blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleExportHTML = async () => {
        setTextoBotao('Exportando...');
        if (!treinoRef.current) { setTextoBotao('Exportar Planilha Animada'); return; }
        try {
            const clone = treinoRef.current.cloneNode(true);
            const images = clone.querySelectorAll('img');
            for (const img of images) {
                const src = img.getAttribute('src');
                try {
                    const response = await fetch(src);
                    const blob = await response.blob();
                    img.src = await toBase64(blob);
                } catch (error) { console.error('Falha ao embutir imagem:', src, error); }
            }
            const cssContent = Array.from(document.styleSheets).map(sheet => { try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join(''); } catch (e) { return ''; }}).join('');
            const htmlString = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Treino - ${alunoNome}</title><style>${cssContent}</style></head><body>${clone.outerHTML}</body></html>`;
            const blob = new Blob([htmlString], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `treino-${alunoNome.replace(/ /g, '_') || 'aluno'}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setTextoBotao('✅ Exportado!');
            setTimeout(() => setTextoBotao('Exportar Planilha Animada'), 2500);
        } catch (error) {
            console.error("Erro ao gerar o HTML:", error);
            alert("Ocorreu um erro ao gerar o arquivo.");
            setTextoBotao('Exportar Planilha Animada');
        }
    };

    const conteudoTreino = (
        <div ref={treinoRef} className="container-treino">
            <header className="cabecalho-treino-novo">
                <div className="cabecalho-texto">
                  <h2>Rodolfo Ferraz</h2>
                  <p className="subtitulo-personal">Personal Trainer</p>
                  <p className="nome-aluno"><strong>Aluno(a):</strong> {alunoNome || '____________________'}</p>
                </div>
                <div className="cabecalho-logo">
                    <img src={`/${LOGO_FILENAME}`} alt="Logo Personal Trainer" className="logo-img" />
                </div>
            </header>
            <main className="grid-exercicios">
                {(lista || []).map((ex, index) => (
                    <div key={index} className="card-exercicio">
                        <span className="numero-exercicio">{index + 1}</span>
                        <img src={`/gifs/${ex.gif}`} alt={ex.nome} className="gif-exercicio" />
                        <p className="nome-exercicio"><strong>{ex.nome}</strong></p>
                        <p className="serie-exercicio">3x10 rep</p>
                    </div>
                ))}
            </main>
            <footer className="rodape-treino-novo">
                <h3>Observações:</h3>
                <p className="observacoes-texto">{observacoes || 'Nenhuma.'}</p>
            </footer>
        </div>
    );

    if (isModoVisualizacao) { return conteudoTreino; }

    return (
        <div>
            <div className="modal-header">
                <h2>Pré-visualização do Treino</h2>
                <button onClick={onClose} className="close-button">&times;</button>
            </div>
            {/* A MUDANÇA ESTÁ AQUI: A logo foi removida */}
            <div className="modal-actions">
                <button onClick={handleExportHTML} className="export-button">{textoBotao}</button>
            </div>
            {conteudoTreino}
        </div>
    );
};
export default TreinoVisual;