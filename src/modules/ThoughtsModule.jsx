import React, { useState } from 'react';
import { Lightbulb, Plus, Tag, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { saveStore } from '../services/store.js';

export default function ThoughtsModule({ state, setState }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Geral');

  const handleAddThought = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newThought = {
      id: 'th_' + Date.now(),
      title,
      content,
      tag,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updated = {
      ...state,
      thoughts: [newThought, ...state.thoughts]
    };
    setState(updated);
    saveStore(updated);
    setTitle('');
    setContent('');
  };

  const handleDeleteThought = (id) => {
    const updated = {
      ...state,
      thoughts: state.thoughts.filter(t => t.id !== id)
    };
    setState(updated);
    saveStore(updated);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pensamentos & Notas</h1>
        <p className="page-subtitle">Guarde ideias rápidas, anotações de estudo e insights capturados pelo assistente.</p>
      </div>

      {/* Formulário de Criação */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--accent-primary)" />
          Criar Nova Anotação
        </h3>
        <form onSubmit={handleAddThought} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Título da anotação..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
            <input 
              type="text" 
              placeholder="Tag (ex: Arquitetura, IA)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <textarea 
            rows="3"
            placeholder="Escreva seus pensamentos..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="topbar-btn btn-primary" style={{ padding: '8px 20px' }}>
              Salvar Anotação
            </button>
          </div>
        </form>
      </div>

      {/* Grid de Cards de Notas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {state.thoughts.map(th => (
          <div key={th.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', padding: '2px 8px', borderRadius: '4px' }}>
                  {th.tag}
                </span>
                <button 
                  onClick={() => handleDeleteThought(th.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{th.title}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{th.content}</p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CalendarIcon size={12} />
              <span>{th.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
