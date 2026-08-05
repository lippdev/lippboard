import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { saveStore } from '../services/store.js';
import { TASK_STATUS_OPTIONS, getTaskStatusMeta, normalizeTaskStatus } from '../services/taskStatus.js';

const CATEGORY_OPTIONS = ['Dev', 'GitHub', 'Idiomas', 'Pessoal', 'Subagente'];
const PRIORITY_OPTIONS = ['Alta', 'Média', 'Baixa'];

export default function TasksModule({ state, setState }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState('Dev');
  const [priority, setPriority] = useState('Alta');
  const [status, setStatus] = useState('a_fazer');
  const [dueDate, setDueDate] = useState('Hoje');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask = {
      id: 't_' + Date.now(),
      title: taskTitle.trim(),
      category,
      priority,
      status: normalizeTaskStatus(status),
      dueDate: dueDate.trim() || 'Hoje'
    };

    const updated = {
      ...state,
      tasks: [newTask, ...state.tasks]
    };
    setState(updated);
    saveStore(updated);
    setTaskTitle('');
    setCategory('Dev');
    setPriority('Alta');
    setStatus('a_fazer');
    setDueDate('Hoje');
    setIsCreateOpen(false);
  };

  const updateTaskStatus = (id, nextStatus) => {
    const updated = {
      ...state,
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: normalizeTaskStatus(nextStatus) } : task))
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
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Tarefas</h1>
          <p className="page-subtitle">Gerencie suas pendências do dia a dia e atribuições executadas por subagentes.</p>
        </div>
        <button className="topbar-btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          <span>Nova tarefa</span>
        </button>
      </div>

      <Modal
        open={isCreateOpen}
        title="Criar nova tarefa"
        onClose={() => setIsCreateOpen(false)}
        width="760px"
        footer={(
          <button type="submit" form="task-create-form" className="topbar-btn btn-primary">
            Salvar tarefa
          </button>
        )}
      >
        <form id="task-create-form" onSubmit={handleAddTask} className="module-form-grid module-form-grid--4">
          <div>
            <label className="form-label">Título da tarefa</label>
            <input
              type="text"
              placeholder="Digite o que precisa ser feito..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="settings-input"
            />
          </div>

          <div>
            <label className="form-label">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="settings-input">
              {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Prioridade</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="settings-input">
              {PRIORITY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Data</label>
            <input
              type="text"
              placeholder="Hoje, amanhã, 12/08..."
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="settings-input"
            />
          </div>

          <div className="module-page-checklist" style={{ gridColumn: '1 / -1' }}>
            {TASK_STATUS_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`page-check-item page-check-item--status ${status === option.value ? 'is-active' : ''}`}
                onClick={() => setStatus(option.value)}
              >
                <span>{option.emoji} {option.label}</span>
                <span style={{ color: option.color }}>{status === option.value ? 'Selecionada' : 'Toque para usar'}</span>
              </button>
            ))}
          </div>
        </form>
      </Modal>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Minha Lista de Tarefas</h3>
        <div className="module-list">
          {state.tasks.map((t) => {
            const meta = getTaskStatusMeta(t.status);
            return (
              <div key={t.id} className="task-card" data-status={normalizeTaskStatus(t.status)}>
                <div className="task-card__main">
                  <div>
                    <h4 className="task-card__title">{t.title}</h4>
                    <span className="task-card__meta">{t.category} · Prazo: {t.dueDate}</span>
                  </div>
                  <span className="task-status-pill" style={{ backgroundColor: meta.bg, color: meta.color }}>
                    {meta.emoji} {meta.label}
                  </span>
                </div>

                <div className="task-card__actions">
                  <div className="task-status-group">
                    {TASK_STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`task-status-btn ${normalizeTaskStatus(t.status) === option.value ? 'is-active' : ''}`}
                        onClick={() => updateTaskStatus(t.id, option.value)}
                        style={normalizeTaskStatus(t.status) === option.value ? { backgroundColor: option.bg, color: option.color, borderColor: option.color } : undefined}
                      >
                        <span>{option.emoji}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="task-card__actions-right">
                    <span className="task-priority-pill" data-priority={t.priority}>
                      {t.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(t.id)}
                      className="task-delete-btn"
                      aria-label="Excluir tarefa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
