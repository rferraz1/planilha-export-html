import React, { useState, useEffect, useMemo } from 'react';
import TreinoVisual from './TreinoVisual';
import './Modal.css';
import './App.css'; // Importa o novo CSS
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ListaDeGifs = React.memo(({ gifs, onAdicionar }) => {
    return (
        <div className="gif-grid">
            {gifs.slice(0, 50).map((gifPath, i) => (
                <img key={i} src={`/gifs/${gifPath}`} alt={gifPath} className="gif-item" onClick={() => onAdicionar(gifPath)} />
            ))}
        </div>
    );
});

function App() {
    const [alunosSalvos, setAlunosSalvos] = useState([]);
    const [alunoNome, setAlunoNome] = useState('');
    const [busca, setBusca] = useState('');
    const [gifsPorExercicio, setGifsPorExercicio] = useState({});
    const [lista, setLista] = useState([]);
    const [observacoes, setObservacoes] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        const alunosDoStorage = localStorage.getItem('alunos_personal');
        if (alunosDoStorage) setAlunosSalvos(JSON.parse(alunosDoStorage));
        
        fetch('/gifs.json').then(res => res.json()).then(data => setGifsPorExercicio(data));
    }, []);

    const salvarAluno = () => {
        if (alunoNome && !alunosSalvos.includes(alunoNome)) {
            const novaLista = [...alunosSalvos, alunoNome];
            setAlunosSalvos(novaLista);
            localStorage.setItem('alunos_personal', JSON.stringify(novaLista));
            alert(`Aluno "${alunoNome}" salvo!`);
        }
    };

    const gifsEncontrados = useMemo(() => gifsPorExercicio[busca.toLowerCase()] || [], [busca, gifsPorExercicio]);

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

    return (
        <div className="app-container">
            {/* --- COLUNA DA ESQUERDA --- */}
            <div className="coluna-esquerda">
                <h3>Biblioteca de Exercícios</h3>
                <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite para buscar..." className="input-padrao" />
                <ListaDeGifs gifs={gifsEncontrados} onAdicionar={adicionarExercicio} />
            </div>

            {/* --- COLUNA DA DIREITA --- */}
            <div className="coluna-direita">
                <h2>Montar Treino</h2>
                <label htmlFor="aluno-nome">Nome do Aluno(a):</label>
                <div className="aluno-container">
                    <input id="aluno-nome" type="text" value={alunoNome} onChange={(e) => setAlunoNome(e.target.value)} list="lista-alunos" className="input-padrao" placeholder="Digite ou selecione um aluno" />
                    {/* --- CORREÇÃO APLICADA AQUI --- */}
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
                    </Droppable>
                </DragDropContext>
                
                <button onClick={() => setMostrarModal(true)} disabled={lista.length === 0} className="botao-primario">
                    Visualizar e Baixar HTML
                </button>
            </div>

            {/* O Modal continua o mesmo */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <TreinoVisual lista={lista} alunoNome={alunoNome} observacoes={observacoes} onClose={() => setMostrarModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
export default App;