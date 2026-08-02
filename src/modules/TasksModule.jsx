import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { saveStore } from '../services/store.js';

export default function TasksModule({ state, setState }) {
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState('Dev');
  const [priority, setPriority] = useState('Alta');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask = {
      id: 't_' + Date.now(),
      title: taskTitle,
      category,
      priority,
      status: 'pendente',
      dueDate: 'Hoje'
    };

    const updated = {
      ...state,
      tasks: [newTask, ...state.tasks]
    };
    setState(updated);
    saveStore(updated);
    setTaskTitle('');
  };

  const handleToggleTask = (id) => {
    const updated = {
      ...state,
      tasks: state.tasks.map(t => {
        if (t.id === id) {
          return { ...t, status: t.status === 'concluida' ? 'pendente' : 'concluida' };
        }
        return t;
      })
    };
    setState(updated);
    saveStore(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = {
      ...state,
      tasks: state.tasks.filter(t => t.id !== id)
    };
    setState(updated);
    saveStore(updated);
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <h1 className="page-title">Tarefas</h1>
        <p className="page-subtitle">Gerencie suas pendências do dia a dia e atribuições executadas por subagentes.</p>
      </div>

      {/* Formulário de Criação de Tarefas */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--accent-primary)" />
          Criar Nova Tarefa
        </h3>
        <form onSubmit={handleAddTask} className="module-form-grid module-form-grid--4">
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Título da Tarefa</label>
            <input 
              type="text" 
              placeholder="Digite o que precisa ser feito..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Categoria</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            >
              <option value="Dev">Dev</option>
              <option value="GitHub">GitHub</option>
              <option value="Idiomas">Idiomas</option>
              <option value="Pessoal">Pessoal</option>
              <option value="Subagente">Subagente</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Prioridade</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            >
              <option value="Alta">Alta</option>
              <option value="Media">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>

          <button type="submit" className="topbar-btn btn-primary" style={{ padding: '10px 18px' }}>
            Adicionar
          </button>
        </form>
      </div>

      {/* Lista de Tarefas */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Minha Lista de Tarefas</h3>
        <div className="module-list">
          {state.tasks.map(t => (
            <div 
              key={t.id}
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: t.status === 'concluida' ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  checked={t.status === 'concluida'}
                  onChange={() => handleToggleTask(t.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                />
                <div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    textDecoration: t.status === 'concluida' ? 'line-through' : 'none' 
                  }}>
                    {t.title}
                  </h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {t.category} · Prazo: {t.dueDate}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: t.priority === 'Alta' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                  color: t.priority === 'Alta' ? 'var(--danger)' : 'var(--warning)'
                }}>
                  {t.priority}
                </span>

                <button 
                  onClick={() => handleDeleteTask(t.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
