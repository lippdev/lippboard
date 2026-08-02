import React, { useState } from 'react';
import { Trophy, Plus, Minus, Trash2 } from 'lucide-react';
import { addGoal, updateGoalProgress, deleteGoal } from '../services/goalsService.js';

export default function GoalsModule({ state, setState }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Dev');
  const [target, setTarget] = useState('10');
  const [current, setCurrent] = useState('0');
  const [unit, setUnit] = useState('dias');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !target.trim()) return;

    try {
      const res = await addGoal({
        title,
        category,
        target: parseInt(target) || 10,
        current: parseInt(current) || 0,
        unit
      });
      setState(res.updatedState);
      setTitle('');
      setTarget('10');
      setCurrent('0');
      setUnit('dias');
      setShowForm(false);
    } catch (err) {
      console.error('Erro ao adicionar meta:', err);
    }
  };

  const handleProgressChange = async (id, newProgress) => {
    try {
      const res = await updateGoalProgress(id, newProgress);
      setState(res.updatedState);
    } catch (err) {
      console.error('Erro ao atualizar progresso da meta:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        const res = await deleteGoal(id);
        setState(res.updatedState);
      } catch (err) {
        console.error('Erro ao excluir meta:', err);
      }
    }
  };

  return (
    <div className="module-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Metas & Objetivos</h1>
          <p className="page-subtitle">Acompanhe e edite seu progresso em hábitos, estudos e metas de desenvolvimento.</p>
        </div>
        <button className="topbar-btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} />
          <span>Nova Meta</span>
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Criar Nova Meta</h3>
          <form onSubmit={handleSubmit} className="module-form-grid module-form-grid--6">
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Título da Meta</label>
              <input 
                type="text" 
                placeholder="Ex: Ler livros técnicos, Concluir cursos..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                <option value="Estudos">Estudos</option>
                <option value="Carreira">Carreira</option>
                <option value="Pessoal">Pessoal</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Meta Alvo</label>
              <input 
                type="number" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Atual</label>
              <input 
                type="number" 
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Unidade</label>
              <input 
                type="text" 
                placeholder="Ex: PRs, dias, etc"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="topbar-btn btn-primary" style={{ padding: '9px 16px' }}>Criar</button>
              <button type="button" className="topbar-btn" onClick={() => setShowForm(false)} style={{ padding: '9px 16px' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="module-panel-grid module-panel-grid--3">
        {(!state.goals || state.goals.length === 0) ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            Nenhuma meta cadastrada.
          </div>
        ) : (
          state.goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', padding: '2px 8px', borderRadius: '4px' }}>
                      {g.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Trophy size={16} color="var(--warning)" />
                      <button 
                        onClick={() => handleDelete(g.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>{g.title}</h4>
                </div>
                
                <div style={{ marginBottom: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progresso</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{g.current} / {g.target} {g.unit} ({pct}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={() => handleProgressChange(g.id, g.current - 1)}
                        disabled={g.current <= 0}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: g.current <= 0 ? 0.4 : 1
                        }}
                      >
                        <Minus size={10} />
                      </button>
                      <button 
                        onClick={() => handleProgressChange(g.id, g.current + 1)}
                        disabled={g.current >= g.target}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: g.current >= g.target ? 0.4 : 1
                        }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
