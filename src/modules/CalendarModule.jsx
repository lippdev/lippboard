import React from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';

export default function CalendarModule({ state }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Calendário & Eventos</h1>
        <p className="page-subtitle">Organização do seu cronograma diário, reuniões e sessões de estudo.</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="var(--accent-primary)" />
          Cronograma de Hoje
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {state.calendar.map(item => (
            <div 
              key={item.id}
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={16} color="var(--info)" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{item.title}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.time} · {item.date}</span>
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                textTransform: 'uppercase'
              }}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
