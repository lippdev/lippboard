import React from 'react';
import { Target, Trophy, Flame } from 'lucide-react';

export default function GoalsModule({ state }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Metas & Objetivos</h1>
        <p className="page-subtitle">Acompanhe seu progresso em hábitos, estudos de idiomas e metas de desenvolvimento.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {state.goals.map(g => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={g.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', padding: '2px 8px', borderRadius: '4px' }}>
                  {g.category}
                </span>
                <Trophy size={18} color="var(--warning)" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>{g.title}</h4>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progresso</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{g.current} / {g.target} {g.unit} ({pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
