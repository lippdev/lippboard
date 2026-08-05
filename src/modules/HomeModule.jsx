import React from 'react';
import { 
  CheckSquare, 
  Languages, 
  GitPullRequest, 
  Smile, 
  ArrowRight,
  Flame
} from 'lucide-react';

export default function HomeModule({ state, setActiveModule, onOpenDrawer }) {
  const pendingTasks = state.tasks.filter(t => t.status === 'a_fazer');
  const recentPrs = state.github.prs.slice(0, 4);

  return (
    <div className="module-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">{state.user.name ? `Olá, ${state.user.name}! 👋` : 'Olá! 👋'}</h1>
          <p className="page-subtitle">Bem-vindo ao seu Lipp Board webOS. Aqui está o resumo do seu dia.</p>
        </div>
        <button className="topbar-btn btn-primary" onClick={onOpenDrawer}>
          <ArrowRight size={16} />
          <span>Abrir ponte do subagente</span>
        </button>
      </div>

      {/* Grid de Resumo */}
      <div className="module-panel-grid module-panel-grid--4" style={{ marginBottom: '24px' }}>
        
        {/* Card Idiomas */}
        <div className="card" onClick={() => setActiveModule('languages')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>ESTUDO DE IDIOMAS</span>
            <Languages size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={28} color="#f97316" />
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800' }}>{state.languages.currentStreak} dias</div>
              <span style={{ fontSize: '12px', color: state.languages.todayStudied ? 'var(--success)' : 'var(--warning)' }}>
                {state.languages.todayStudied ? '✓ Checklist de hoje feita' : '⚠️ Checklist pendente'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Tarefas Pendentes */}
        <div className="card" onClick={() => setActiveModule('tasks')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>TAREFAS PENDENTES</span>
            <CheckSquare size={18} color="var(--info)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>
            {pendingTasks.length} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>tarefas para hoje</span>
          </div>
        </div>

        {/* Card GitHub */}
        <div className="card" onClick={() => setActiveModule('github')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>GITHUB @LIPPDEV</span>
            <GitPullRequest size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>
            {state.github.prs.length} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>PRs ativos</span>
          </div>
        </div>

        {/* Card Humor */}
        <div className="card" onClick={() => setActiveModule('mood')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>NÍVEL DE HUMOR</span>
            <Smile size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--warning)' }}>
            {state.mood.todayScore} / 5
          </div>
        </div>
      </div>

      {/* Layout em 2 Colunas: Tarefas & GitHub PRs Recentes */}
      <div className="module-panel-grid module-panel-grid--2">
        
        {/* Lista de Tarefas do Dia */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Tarefas Prioritárias</h3>
            <button className="topbar-btn" onClick={() => setActiveModule('tasks')} style={{ padding: '4px 10px', fontSize: '12px' }}>
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingTasks.map(t => (
              <div 
                key={t.id} 
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '600' }}>{t.title}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.category} · {t.dueDate}</span>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger)'
                }}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PRs do GitHub Recentes */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Atividade GitHub Recente</h3>
            <button className="topbar-btn" onClick={() => setActiveModule('github')} style={{ padding: '4px 10px', fontSize: '12px' }}>
              Ver tudo <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentPrs.map(pr => (
              <div 
                key={pr.id} 
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '600' }}>{pr.title}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pr.repo}#{pr.prNumber}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--success)' }}>
                  {pr.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
