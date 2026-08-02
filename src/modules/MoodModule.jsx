import React, { useState } from 'react';
import { saveStore } from '../services/store.js';

export default function MoodModule({ state, setState }) {
  const [score, setScore] = useState(state.mood.todayScore);
  const [note, setNote] = useState(state.mood.todayNote);

  const handleSaveMood = (e) => {
    e.preventDefault();
    const updated = {
      ...state,
      mood: {
        ...state.mood,
        todayScore: score,
        todayNote: note,
        history: [
          { date: new Date().toLocaleDateString('pt-BR'), score, note },
          ...state.mood.history
        ]
      }
    };
    setState(updated);
    saveStore(updated);
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <h1 className="page-title">Rastreador de Humor</h1>
        <p className="page-subtitle">Acompanhe seu bem-estar, nível de energia e reflexões diárias.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Como você está se sentindo hoje?</h3>
        
        <div className="module-chip-row" style={{ marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setScore(s)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: score === s ? '2px solid var(--warning)' : '1px solid var(--border-color)',
                backgroundColor: score === s ? 'var(--warning-bg)' : 'var(--bg-input)',
                color: score === s ? 'var(--warning)' : 'var(--text-secondary)',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSaveMood}>
          <textarea
            rows="3"
            placeholder="Escreva uma reflexão sobre o seu dia..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              marginBottom: '14px'
            }}
          />
          <button type="submit" className="topbar-btn btn-primary">
            Salvar Humor do Dia
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Histórico de Humor</h3>
        <div className="module-list">
          {state.mood.history.map((h, idx) => (
            <div key={idx} style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: '600' }}>{h.note || 'Sem reflexão escrita'}</h4>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{h.date}</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--warning)' }}>
                {h.score}/5 ⭐
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
