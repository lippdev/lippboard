import React, { useMemo, useState } from 'react';
import { HeartPulse, Sparkles } from 'lucide-react';
import { saveStore } from '../services/store.js';

const CONTEXT_OPTIONS = ['Geral', 'Trabalho', 'Saúde', 'Família', 'Estudos'];
const MOOD_LABELS = {
  1: 'pesado',
  2: 'baixo',
  3: 'ok',
  4: 'bem',
  5: 'ótimo'
};

export default function MoodModule({ state, setState }) {
  const [score, setScore] = useState(state.mood.todayScore || 3);
  const [note, setNote] = useState(state.mood.todayNote || '');
  const [context, setContext] = useState('Geral');

  const lastSeven = useMemo(() => state.mood.history.slice(0, 7), [state.mood.history]);
  const average = useMemo(() => {
    if (!lastSeven.length) return 0;
    return Math.round((lastSeven.reduce((sum, item) => sum + Number(item.score || 0), 0) / lastSeven.length) * 10) / 10;
  }, [lastSeven]);

  const handleSaveMood = (e) => {
    e.preventDefault();
    const updated = {
      ...state,
      mood: {
        ...state.mood,
        todayScore: score,
        todayNote: note,
        history: [
          { date: new Date().toLocaleDateString('pt-BR'), score, note, context },
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
        <div>
          <h1 className="page-title">Check-in emocional</h1>
          <p className="page-subtitle">Registre como você está e o que influenciou isso. O insight vem do contexto, não só do número.</p>
        </div>
        <div className="stoic-header-badge">
          <HeartPulse size={16} />
          <span>{score}/5 hoje</span>
        </div>
      </div>

      <div className="stoic-insight-strip" style={{ marginBottom: '24px' }}>
        <div className="stoic-insight-card">
          <span>Hoje</span>
          <strong>{MOOD_LABELS[score]}</strong>
        </div>
        <div className="stoic-insight-card">
          <span>Média 7 dias</span>
          <strong>{average || '—'}</strong>
        </div>
        <div className="stoic-insight-card">
          <span>Check-ins</span>
          <strong>{state.mood.history.length}</strong>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Como você está se sentindo hoje?</h3>
          <span className="stoic-pill stoic-pill--accent">{MOOD_LABELS[score]}</span>
        </div>

        <div className="chip-row" style={{ marginBottom: '18px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScore(s)}
              className={`mood-chip ${score === s ? 'is-active' : ''}`}
            >
              <span>{s}</span>
              <small>{MOOD_LABELS[s]}</small>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label className="form-label">Contexto principal</label>
          <div className="chip-row">
            {CONTEXT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`chip ${context === option ? 'is-active' : ''}`}
                onClick={() => setContext(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSaveMood}>
          <label className="form-label">O que influenciou esse humor?</label>
          <textarea
            rows="4"
            placeholder="Escreva o que puxou você para cima ou para baixo hoje..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="settings-input"
            style={{ marginBottom: '14px', resize: 'vertical', minHeight: '132px' }}
          />
          <button type="submit" className="topbar-btn btn-primary">
            <Sparkles size={15} />
            <span>Salvar check-in</span>
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Histórico de humor</h3>
        <div className="module-list">
          {state.mood.history.map((h, idx) => (
            <div key={idx} className="stoic-list-item stoic-list-item--mood">
              <div>
                <h4>{h.note || 'Sem reflexão escrita'}</h4>
                <span>{h.date}</span>
              </div>
              <div className="stoic-mood-meta">
                <span className="stoic-pill stoic-pill--accent">{h.context || 'Geral'}</span>
                <strong>{h.score}/5</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
