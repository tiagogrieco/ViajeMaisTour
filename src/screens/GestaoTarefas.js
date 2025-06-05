// src/screens/GestaoTarefas.js
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaFlag,
  FaUserAlt,        // Para cliente_id
  FaCalendarAlt,    // Para data_vencimento
  FaClipboardList,  // Para sub_descricao
  FaRegClock,       // Para data_criacao
  FaUserTag         // Para responsavel
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './GestaoTarefas.css';

const statusLabels = {
  pendente: 'Pendente',
  andamento: 'Em Andamento',
  concluida: 'Concluída'
};

const statusOrder = ['pendente', 'andamento', 'concluida'];

const priorityLabels = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta'
};

export default function GestaoTarefas() {
  const [tarefas, setTarefas] = useState({
    pendente: [],
    andamento: [],
    concluida: []
  });
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Define a URL base do backend usando a variável de ambiente
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tarefasRes, clientesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/tarefas`),
        fetch(`${BACKEND_URL}/clientes`)
      ]);

      if (!tarefasRes.ok) throw new Error('Erro ao buscar tarefas.');
      if (!clientesRes.ok) throw new Error('Erro ao buscar clientes.');

      const tarefasData = await tarefasRes.json();
      const clientesData = await clientesRes.json();
      setClientes(clientesData);

      const organized = {
        pendente: [],
        andamento: [],
        concluida: []
      };
      tarefasData.forEach(tarefa => {
        if (statusOrder.includes(tarefa.status)) {
          organized[tarefa.status].push(tarefa);
        } else {
          // Se o status não for um dos esperados, coloque em pendente por padrão
          organized.pendente.push({...tarefa, status: 'pendente'});
        }
      });
      setTarefas(organized);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [BACKEND_URL]); // Adicionado BACKEND_URL às dependências

  const getClienteNome = (cliente_id) => {
    const cliente = clientes.find(c => c.id === cliente_id);
    return cliente ? cliente.nome : `Cliente ID: ${cliente_id}`;
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // O draggableId está como "task-${tarefa.id}", precisamos extrair o ID numérico
    const taskId = parseInt(draggableId.split('-')[1]);

    const sourceColKey = source.droppableId;
    const destColKey = destination.droppableId;

    const newTarefasState = { ...tarefas };
    const sourceColTasks = [...newTarefasState[sourceColKey]];
    const destColTasks = sourceColKey === destColKey ? sourceColTasks : [...newTarefasState[destColKey]];

    const [movedTask] = sourceColTasks.splice(source.index, 1);
    destColTasks.splice(destination.index, 0, movedTask);

    newTarefasState[sourceColKey] = sourceColTasks;
    if (sourceColKey !== destColKey) {
      newTarefasState[destColKey] = destColTasks;
    }
    
    setTarefas(newTarefasState);

    try {
      const res = await fetch(`${BACKEND_URL}/tarefas/${taskId}`, { // Usar taskId numérico
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...movedTask, status: destColKey }) // Atualiza o status no objeto da tarefa
      });
      if (!res.ok) {
        // Se falhar, reverter o estado (opcional, ou mostrar erro e pedir refresh)
        console.error('Falha ao atualizar tarefa no servidor, revertendo estado local.');
        fetchData(); // Simplesmente recarrega os dados para consistência
        throw new Error('Erro ao atualizar tarefa no servidor.');
      }
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      setError('Erro ao atualizar tarefa no servidor. Por favor, recarregue a página.');
      fetchData(); // Recarrega para tentar sincronizar com o servidor
    }
  };

  const handleDeleteTask = async (taskId, taskDesc) => {
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${taskDesc}"?`)) {
      try {
        const res = await fetch(`${BACKEND_URL}/tarefas/${taskId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          const updatedTasks = { ...tarefas };
          for (const statusKey in updatedTasks) {
            updatedTasks[statusKey] = updatedTasks[statusKey].filter(task => task.id !== taskId);
          }
          setTarefas(updatedTasks);
        } else {
          alert('Erro ao excluir tarefa no servidor.');
        }
      } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
        alert('Erro de conexão ao excluir tarefa.');
      }
    }
  };

  const handleEditTask = (taskId) => {
    // Navegar para uma rota de edição ou abrir um modal
    alert(`Função de Editar Tarefa ID: ${taskId} (será implementada)`);
    // Ex: navigate(`/tarefas/editar/${taskId}`);
  };

  const handleAddNewTask = () => {
    alert('Função de Adicionar Nova Tarefa (será implementada)');
    // Ex: navigate('/tarefas/nova');
  };

  if (loading) {
    return <div className="loading-message">Carregando tarefas...</div>;
  }

  if (error) {
    return <div className="error-message">Erro: {error}</div>;
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h2>✅ Gestão de Tarefas</h2>
        <button className="btn-add-task" onClick={handleAddNewTask}>
          <FaPlus /> Adicionar Nova Tarefa
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {statusOrder.map(statusKey => (
            <Droppable droppableId={statusKey} key={statusKey}>
              {(provided) => (
                <div
                  className="kanban-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3 className={`column-title ${statusKey}`}>
                    <span className="column-title-text">{statusLabels[statusKey]}</span>
                    <span className="column-task-count">{tarefas[statusKey]?.length || 0}</span>
                  </h3>
                  {(tarefas[statusKey]?.length || 0) === 0 ? (
                    <div className="empty-column-message">
                      Nenhuma tarefa nesta coluna.
                    </div>
                  ) : (
                    tarefas[statusKey].map((tarefa, index) => (
                      <Draggable key={tarefa.id} draggableId={`task-${tarefa.id}`} index={index}>
                        {(providedDraggable) => (
                          <div
                            className={`kanban-item priority-${tarefa.prioridade || 'media'}`}
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                          >
                            <div className="item-header">
                              <span className={`priority-tag priority-${tarefa.prioridade || 'media'}`}>
                                <FaFlag /> {priorityLabels[tarefa.prioridade] || 'Média'}
                              </span>
                              <span className="task-id">ID #{tarefa.id}</span>
                            </div>
                            <p className="item-description">
                              <strong>{tarefa.descricao}</strong>
                            </p>

                            {tarefa.cliente_id && (
                              <p className="item-detail">
                                <FaUserAlt /> <span>{getClienteNome(tarefa.cliente_id)}</span>
                              </p>
                            )}
                            {tarefa.data_vencimento && (
                              <p className="item-detail">
                                <FaCalendarAlt /> <span>Vencimento: {new Date(tarefa.data_vencimento).toLocaleDateString('pt-BR')}</span>
                              </p>
                            )}

                            {/* Mais informações adicionadas aqui */}
                            {tarefa.sub_descricao && (
                              <p className="item-sub-description">
                                <FaClipboardList /> <span>{tarefa.sub_descricao}</span>
                              </p>
                            )}
                            {tarefa.data_criacao && (
                              <p className="item-detail item-creation-date">
                                <FaRegClock /> <span>Criada em: {new Date(tarefa.data_criacao).toLocaleDateString('pt-BR')}</span>
                              </p>
                            )}
                            {tarefa.responsavel && (
                              <p className="item-detail item-assignee">
                                <FaUserTag /> <span>Responsável: {tarefa.responsavel}</span>
                              </p>
                            )}

                            <div className="item-actions">
                              <button onClick={() => handleEditTask(tarefa.id)} className="btn-task-edit" title="Editar Tarefa">
                                <FaEdit />
                              </button>
                              <button onClick={() => handleDeleteTask(tarefa.id, tarefa.descricao)} className="btn-task-delete" title="Excluir Tarefa">
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
