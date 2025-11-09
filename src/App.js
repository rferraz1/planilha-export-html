import React, { useState, useEffect, useMemo } from 'react';
import TreinoVisual from './TreinoVisual';
import './Modal.css';
import './App.css'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import lzString from 'lz-string';

// Componente ListaDeGifs (sem mudanças)
const ListaDeGifs = React.memo(({ gifs, onAdicionar }) => {
    return (
        <div className="gif-grid">
            {gifs.slice(0, 50).map((gifPath, i) => (
                <img key={i} src={`https://chipper-churros-5621ed.netlify.app/gifs/${gifPath}`} alt={gifPath} className="gif-item" onClick={() => onAdicionar(gifPath)} />
            ))}
        </div>
    );
});

function App() {
    
    // Lógica de leitura do link (sem mudanças)
    const [dadosDoLink, setDadosDoLink] = useState(null);
    const [carregandoLink, setCarregandoLink] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const treinoQuery = params.get('treino');

        if (treinoQuery) {
            try {
                const jsonDoTreino = lzString.decompressFromEncodedURIComponent(treinoQuery);
                const dados = JSON.parse(jsonDoTreino);
                if (dados && dados.lista && dados.aluno !== undefined && dados.obs !== undefined) {
                    setDadosDoLink(dados);
                }
            } catch (error) {
                console.error("Erro ao decodificar treino:", error);
            }
        }
        setCarregandoLink(false);
    }, []);


    // Hooks normais do app
    const [alunosSalvos, setAlunosSalvos] = useState([]);
    const [alunoNome, setAlunoNome] = useState('');
    const [busca, setBusca] = useState('');
    const [gifsPorExercicio, setGifsPorExercicio] = useState({});
    const [lista, setLista] = useState([]);
    const [observacoes, setObservacoes] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    
    // NOVO ESTADO PARA AS PASTAS (PONTO 1)
    const [gruposMusculares, setGruposMusculares] = useState([]);

    useEffect(() => {
        if (!carregandoLink && !dadosDoLink) {
            const alunosDoStorage = localStorage.getItem('alunos_personal');
            if (alunosDoStorage) setAlunosSalvos(JSON.parse(alunosDoStorage));
            
            fetch('/gifs.json').then(res => res.json()).then(data => {
                setGifsPorExercicio(data);
                
                // NOVO: Extrai os grupos (chaves) do JSON
                const grupos = Object.keys(data).sort(); // Ordena alfabeticamente
                setGruposMusculares(grupos);
            });
        }
    }, [carregandoLink, dadosDoLink]);

    
    // LÓGICA DE BUSCA MELHORADA (PONTO 2)
    const gifsEncontrados = useMemo(() => {
        const buscaLimpa = busca.toLowerCase().trim();
        
        if (!buscaLimpa) {
            return [];
        }

        const todasChaves = Object.keys(gifsPorExercicio);
        
        const chavesEncontradas = todasChaves.filter(chave => 
            chave.toLowerCase().startsWith(buscaLimpa)
        );
        
        const todosGifs = chavesEncontradas.flatMap(chave => gifsPorExercicio[chave]);
        
        return todosGifs;
    }, [busca, gifsPorExercicio]);


    // Funções normais do app (sem mudanças)
    const salvarAluno = () => {
        if (alunoNome && !alunosSalvos.includes(alunoNome)) {
            const novaLista = [...alunosSalvos, alunoNome];
            setAlunosSalvos(novaLista);
            localStorage.setItem('alunos_personal', JSON.stringify(novaLista));
            alert(`Aluno "${alunoNome}" salvo!`);
        }
    };
    
    const adicionarExercicio = (gifPath) => {
        if (lista.length >= 9) { alert('Máximo de 9 exercícios.'); return; }
        const nomeDoExercicio = gifPath.split('/').pop().replace('.gif', '').replace(/_/g, ' ');
        if (!lista.some(item => item.gif === gifPath)) {
            const novoExercicio = { id: `ex-${Date.now()}`, nome: nomeDoExercicio, gif: gifPath, variacao: '' };
            setLista([...lista, novoExercicio]);
        }
    };
    const deletarExercicio = (idParaDeletar) => setLista(lista.filter(item => item.id !== idParaDeletar));
    const handleInputChange = (id, campo, valor) => setLista(lista.map(item => item.id === id ? { ...item, [campo]: valor } : item));
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(lista);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setLista(items);
    };


    // RENDERIZAÇÃO CONDICIONAL (sem mudanças)
    if (carregandoLink) {
        return <div className="app-container"><h1>Carregando...</h1></div>;
    }

    if (dadosDoLink) {
        return (
            <div style={{backgroundColor: '#f4f7f6', padding: '0.5rem', minHeight: '100vh'}}> 
                <div style={{
                    maxWidth: '1000px', 
                    margin: '0.5rem auto', 
                    background: 'none', 
                    boxShadow: 'none', 
                    padding: '0'
                }}>
                    <TreinoVisual 
                        lista={dadosDoLink.lista} 
                        alunoNome={dadosDoLink.aluno} 
                        observacoes={dadosDoLink.obs} 
                        onClose={() => {}}
                        isReadOnly={true}
                    />
                </div>
            </div>
        );
    }

    // MODO NORMAL (com as novas pastas)
    return (
        <div className="app-container">
            {/* --- COLUNA DA ESQUERDA --- */}
            <div className="coluna-esquerda">
                <h3>Biblioteca de Exercícios</h3>
                <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite para buscar..." className="input-padrao" />
                
                {/* NOVO: BOTÕES DE GRUPO MUSCULAR (PONTO 1) */}
                <div className="grupo-muscular-container">
                    {gruposMusculares.map(grupo => (
                        <button 
                            key={grupo} 
                            className="botao-grupo"
                            onClick={() => setBusca(grupo)} 
                        >
                            {grupo.charAt(0).toUpperCase() + grupo.slice(1)} 
                        </button>
                    ))}
                </div>
                
                <ListaDeGifs gifs={gifsEncontrados} onAdicionar={adicionarExercicio} />
            </div>

            {/* --- COLUNA DA DIREITA (sem mudanças) --- */}
            <div className="coluna-direita">
                <h2>Montar Treino</h2>
                <label htmlFor="aluno-nome">Nome do Aluno(a):</label>
                <div className="aluno-container">
                    <input id="aluno-nome" type="text" value={alunoNome} onChange={(e) => setAlunoNome(e.target.value)} list="lista-alunos" className="input-padrao" placeholder="Digite ou selecione um aluno" />
                    <datalist id="lista-alunos">{alunosSalvos.map(nome => <option key={nome} value={nome} />)}</datalist>
                    <button onClick={salvarAluno} className="botao-primario botao-salvar">Salvar</button>
                </div>

                <label>Observações Gerais:</label>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="textarea-padrao" placeholder="Adicione observações gerais sobre o treino..." />
                
                <h3>Exercícios Adicionados ({lista.length} / 9)</h3>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="exercicios">
                        {(provided) => (
                            <ul {...provided.droppableProps} ref={provided.innerRef} className="lista-exercicios">
                                {lista.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided) => (
                                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="card-exercicio">
                                                <div className="card-exercicio-header">
                                                    <input type="text" value={item.nome} onChange={(e) => handleInputChange(item.id, 'nome', e.target.value)} className="input-nome-exercicio" />
                                                    <button onClick={() => deletarExercicio(item.id)} className="botao-deletar">&#10005;</button>
                                                </div>
                                                <textarea placeholder="Adicionar informação pontual (ex: 3x12, cadência 2-2)" value={item.variacao} onChange={(e) => handleInputChange(item.id, 'variacao', e.target.value)} className="textarea-padrao textarea-variacao" />
                                            </li>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable> {/* <-- AQUI ESTÁ A CORREÇÃO */}
                </DragDropContext>
                
                <button onClick={() => setMostrarModal(true)} disabled={lista.length === 0} className="botao-primario">
                    Visualizar Treino
                </button>
            </div>

            {/* O Modal que abre o TreinoVisual (sem mudanças) */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <TreinoVisual 
                            lista={lista} 
                            alunoNome={alunoNome} 
                            observacoes={observacoes} 
                            onClose={() => setMostrarModal(false)}
                            isReadOnly={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
export default App;