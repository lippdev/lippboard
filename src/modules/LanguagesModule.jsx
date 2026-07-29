import React, { useState } from 'react';
import { Flame, CheckCircle, Clock, BookOpen, Plus } from 'lucide-react';
import { saveStore } from '../services/store.js';

export default function LanguagesModule({ state, setState }) {
  const [topicInput, setTopicInput] = useState('');
  const [minutesInput, setMinutesInput] = useState('30');
  const [selectedLang, setSelectedLang] = useState('Inglês');

  const handleToggleToday = () => {
    const isStudied = !state.languages.todayStudied;
    const newStreak = isStudied ? state.languages.currentStreak + 1 : Math.max(0, state.languages.currentStreak - 1);
    
    const updated = {
      ...state,
      languages: {
        ...state.languages,
        todayStudied: isStudied,
        currentStreak: newStreak
      }
    };

    if (isStudied) {
      updated.languages.history.unshift({
        date: new Date().toISOString().split('T')[0],
        studied: true,
        minutes: parseInt(minutesInput) || 30,
        topic: 'Checklist diária confirmada',
        language: selectedLang
      });
    }

    setState(updated);
    saveStore(updated);
  };

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    const mins = parseInt(minutesInput) || 30;
    const updated = {
      ...state,
      languages: {
        ...state.languages,
        todayStudied: true,
        todayMinutes: state.languages.todayMinutes + mins,
        history: [
          {
            date: new Date().toISOString().split('T')[0],
            studied: true,
            minutes: mins,
            topic: topicInput,
            language: selectedLang
          },
          ...state.languages.history
        ]
      }
    };
    setState(updated);
    saveStore(updated);
    setTopicInput('');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Estudo de Idiomas</h1>
        <p className="page-subtitle">Acompanhe sua checklist diária de estudos, ofensiva (streak) e histórico de tópicos.</p>
      </div>

      {/* Grid Banner Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Card 1: Checklist Diária */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>CHECKLIST DO DIA</span>
            <BookOpen size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ margin: '16px 0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: state.languages.todayStudied ? 'var(--success)' : 'var(--warning)' }}>
              {state.languages.todayStudied ? '✓ Estudo Concluído Hoje!' : '⚠️ Pendente de Estudo'}
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Marque o checklist quando praticar seu idioma diário.
            </p>
          </div>
          <button 
            className={`topbar-btn ${state.languages.todayStudied ? 'btn-primary' : ''}`}
            onClick={handleToggleToday}
            style={{ width: '100%', justifyContent: 'center', backgroundColor: state.languages.todayStudied ? 'var(--success)' : 'var(--accent-primary)', color: '#fff', border: 'none' }}
          >
            <CheckCircle size={16} />
            <span>{state.languages.todayStudied ? 'Desmarcar Checklist' : 'Marcar que Estudei Hoje!'}</span>
          </button>
        </div>

        {/* Card 2: Streak de Ofensiva */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>OFENSIVA (STREAK)</span>
            <Flame size={20} color="#f97316" />
          </div>
          <div style={{ margin: '12px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: '#f97316' }}>{state.languages.currentStreak}</span>
            <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>dias seguidos</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            🔥 Mantenha a constância para bater sua meta mensal!
          </p>
        </div>

        {/* Card 3: Tempo Dedicado */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>TEMPO HOJE</span>
            <Clock size={18} color="var(--info)" />
          </div>
          <div style={{ margin: '12px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--info)' }}>{state.languages.todayMinutes}</span>
            <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>/ {state.languages.targetMinutes} min</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Meta diária: 45 minutos recomendados.
          </p>
        </div>
      </div>

      {/* Formulário de Registro de Estudo */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--accent-primary)" />
          Registrar Sessão de Estudo
        </h3>
        <form onSubmit={handleAddSession} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>O que você estudou?</label>
            <input 
              type="text" 
              placeholder="Ex: Leitura de documentação, vocabulário, audição de podcast..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
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
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Minutos</label>
            <input 
              type="number" 
              value={minutesInput}
              onChange={(e) => setMinutesInput(e.target.value)}
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
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Idioma</label>
            <select 
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
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
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Japonês">Japonês</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <button type="submit" className="topbar-btn btn-primary" style={{ padding: '10px 18px' }}>
            Salvar
          </button>
        </form>
      </div>

      {/* Histórico Recente de Estudos */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Histórico Recente</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {state.languages.history.map((item, idx) => (
            <div 
              key={idx}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={16} color="var(--success)" />
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '600' }}>{item.topic}</h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{item.date} · {item.language}</span>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                +{item.minutes} min
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
