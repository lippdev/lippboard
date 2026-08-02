import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { addEvent, deleteEvent } from '../services/calendarService.js';

export default function CalendarModule({ state, setState }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:00 - 15:00');
  const [date, setDate] = useState('Hoje');
  const [type, setType] = useState('trabalho');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await addEvent({ title, time, date, type });
      setState(res.updatedState);
      setTitle('');
      setShowForm(false);
    } catch (err) {
      console.error('Erro ao adicionar evento:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir este compromisso?')) {
      try {
        const res = await deleteEvent(id);
        setState(res.updatedState);
      } catch (err) {
        console.error('Erro ao excluir evento:', err);
      }
    }
  };

  return (
    <div className="module-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Calendário & Eventos</h1>
          <p className="page-subtitle">Organização do seu cronograma diário, reuniões e sessões de estudo.</p>
        </div>
        <button className="topbar-btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} />
          <span>Novo Evento</span>
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Criar Novo Evento</h3>
          <form onSubmit={handleSubmit} className="module-form-grid module-form-grid--5">
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Título do Compromisso</label>
              <input 
                type="text" 
                placeholder="Ex: Reunião de Daily, Estudo de Inglês..."
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Horário</label>
              <input 
                type="text" 
                placeholder="Ex: 14:00 - 15:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Dia</label>
              <select 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
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
                <option value="Hoje">Hoje</option>
                <option value="Amanhã">Amanhã</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Categoria</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
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
                <option value="trabalho">Trabalho</option>
                <option value="estudo">Estudo</option>
                <option value="dev">Dev</option>
                <option value="pessoal">Pessoal</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="topbar-btn btn-primary" style={{ padding: '9px 16px' }}>Criar</button>
              <button type="button" className="topbar-btn" onClick={() => setShowForm(false)} style={{ padding: '9px 16px' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="var(--accent-primary)" />
          Cronograma
        </h3>
        <div className="module-list" style={{ gap: '12px' }}>
          {(!state.calendar || state.calendar.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              Nenhum compromisso agendado.
            </div>
          ) : (
            state.calendar.map(item => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
