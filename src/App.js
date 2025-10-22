import React, { useState, useEffect, useMemo } from 'react';
import TreinoVisual from './TreinoVisual';
import './Modal.css';

// --- COMPONENTE OTIMIZADO PARA A LISTA DE GIFS ---
// React.memo impede que este componente seja redesenhado desnecessariamente
const ListaDeGifs = React.memo(({ gifs, onAdicionar }) => {
    console.log("Renderizando lista de GIFs..."); // Você verá isso no console apenas quando a busca mudar
    return (
        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap' }}>
            {gifs.slice(0, 50).map((gifPath, i) => (
                <img key={i} src={`/gifs/${gifPath}`} alt={gifPath} width="150" style={{ cursor: 'pointer', margin: '0.5rem', borderRadius: '8px' }} onClick={() => onAdicionar(gifPath)} />
            ))}
        </div>
    );
});


function App() {
    const [busca, setBusca] = useState('');
    const [gifsPorExercicio, setGifsPorExercicio] = useState({});
    const [lista, setLista] = useState([]);
    const [alunoNome, setAlunoNome] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        fetch('/gifs.json')
            .then((res) => res.json())
            .then((data) => setGifsPorExercicio(data))
            .catch((err) => console.error('Erro ao carregar gifs.json:', err));
    }, []);

    // useMemo garante que a lista de GIFs só seja recalculada quando a busca mudar
    const gifsEncontrados = useMemo(() => gifsPorExercicio[busca.toLowerCase()] || [], [busca, gifsPorExercicio]);

    const adicionarExercicio = (gifPath) => {
        if (lista.length >= 9) { alert('Máximo de 9 exercícios.'); return; }
        const nomeDoExercicio = gifPath.split('/').pop().replace('.gif', '');
        if (!lista.some(item => item.gif === gifPath)) {
            setLista([...lista, { nome: nomeDoExercicio, gif: gifPath }]);
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center' }}>Montar Treino</h1>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h3>Adicione manualmente:</h3>
                    <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite para buscar..." style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }} />
                    <ListaDeGifs gifs={gifsEncontrados} onAdicionar={adicionarExercicio} />
                </div>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2>Dados do Treino</h2>
                    <label>Nome do Aluno(a):</label>
                    <input type="text" value={alunoNome} onChange={(e) => setAlunoNome(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
                    <label>Observações:</label>
                    <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '0.5rem', marginBottom: '1rem' }} />
                    <h3>Exercícios Adicionados ({lista.length} / 9)</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {lista.map((item, index) => (
                            <li key={index} style={{ fontSize: '1.1rem', marginBottom: '0.75rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '6px' }}>
                                <strong>{item.nome}</strong>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setMostrarModal(true)} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', fontSize: '1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Visualizar e Exportar
                    </button>
                </div>
            </div>
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <TreinoVisual 
                            lista={lista} 
                            alunoNome={alunoNome}
                            observacoes={observacoes}
                            onClose={() => setMostrarModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
export default App;