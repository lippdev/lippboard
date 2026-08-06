import React, { useEffect, useState } from 'react';
import { ArrowRight, Feather, HeartPulse, Languages, GitPullRequest, Smile, Wind, CheckSquare, Flame, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { saveStore } from '../services/store.js';

const RITUALS = [
  {
    id: 'thoughts',
    label: 'Escrever reflexão',
    description: 'Abra o diário guiado e solte o que pesa.',
    icon: Feather,
    action: 'thoughts'
  },
  {
    id: 'mood',
    label: 'Check-in emocional',
    description: 'Registre como o dia está te tratando.',
    icon: HeartPulse,
    action: 'mood'
  },
  {
    id: 'breathing',
    label: 'Pausa guiada',
    description: '60s para desacelerar e voltar ao eixo.',
    icon: Wind,
    action: 'breathing'
  }
];

const DAILY_PROMPTS = [
  'O que merece a minha atenção hoje?',
  'O que eu posso soltar antes de dormir?',
  'Qual foi a parte mais difícil do dia?',
  'O que ficou claro depois de hoje?'
];

export default function HomeModule({ state, setActiveModule }) {
  const pendingTasks = state.tasks.filter((t) => t.status === 'a_fazer');
  const recentPrs = state.github.prs.slice(0, 4);
  const onboardingCompleted = Boolean(state.onboarding?.completed);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!breathingOpen) return undefined;

    setSecondsLeft(60);
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [breathingOpen]);

  const openRitual = (action) => {
    if (action === 'breathing') {
      setBreathingOpen(true);
      return;
    }
    setActiveModule(action);
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ritual de hoje</h1>
          <p className="page-subtitle">Um espaço curto para refletir, ajustar o humor e começar com intenção.</p>
        </div>
        <button className="topbar-btn btn-primary" onClick={() => setActiveModule('thoughts')}>
          <Feather size={16} />
          <span>Escrever agora</span>
        </button>
      </div>

      {!onboardingCompleted && (
        <div className="card" style={{ marginBottom: '20px', border: '1px solid rgba(59,130,246,.28)', background: 'linear-gradient(180deg, rgba(59,130,246,.12), rgba(15,23,42,.94))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <span className="stoic-kicker">ONBOARDING</span>
              <h3 style={{ margin: '6px 0 8px', fontSize: '18px', fontWeight: 800 }}>Configuração rápida ainda pendente</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '720px' }}>
                O básico já está pronto. Só falta marcar esse onboarding como concluído para limpar a Home e seguir com o fluxo normal.
              </p>
            </div>
            <button
              type="button"
              className="topbar-btn btn-primary"
              onClick={() => {
                const updated = {
                  ...state,
                  onboarding: {
                    ...(state.onboarding || {}),
                    completed: true,
                    completedAt: new Date().toISOString(),
                  },
                };
                saveStore(updated);
                window.location.reload();
              }}
            >
              <CheckCircle2 size={16} />
              <span>Concluir onboarding</span>
            </button>
          </div>
        </div>
      )}
      <div className="stoic-hero card">
        <div className="stoic-hero__copy">
          <span className="stoic-kicker">CHECK-IN DIÁRIO</span>
          <h2>Menos ruído. Mais clareza.</h2>
          <p>Comece por uma reflexão, passe pelo humor e feche com uma pausa curta. É simples de manter porque não tenta parecer um app de tudo.</p>
        </div>

        <div className="stoic-hero__actions">
          {RITUALS.map(({ id, label, description, icon: Icon, action }) => (
            <button key={id} type="button" className="stoic-ritual-card" onClick={() => openRitual(action)}>
              <div className="stoic-ritual-card__icon"><Icon size={18} /></div>
              <div>
                <strong>{label}</strong>
                <span>{description}</span>
              </div>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className="stoic-prompt-banner card">
        <div>
          <span className="stoic-kicker">PERGUNTA DE HOJE</span>
          <h3>{DAILY_PROMPTS[new Date().getDate() % DAILY_PROMPTS.length]}</h3>
        </div>
        <button className="topbar-btn" onClick={() => setActiveModule('thoughts')}>
          <Feather size={14} />
          <span>Responder no diário</span>
        </button>
      </div>

      <Modal
        open={breathingOpen}
        title="Pausa guiada"
        onClose={() => setBreathingOpen(false)}
        width="560px"
        footer={(
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" className="topbar-btn" onClick={() => setSecondsLeft(60)}>Reiniciar</button>
            <button type="button" className="topbar-btn btn-primary" onClick={() => setBreathingOpen(false)}>Fechar</button>
          </div>
        )}
      >
        <div className="stoic-breathing">
          <div className="stoic-breathing__orb">
            <span>{secondsLeft}</span>
            <small>seg</small>
          </div>
          <p>Respira 4-4-4-4: inspira, segura, solta, pausa. É só isso.</p>
          <div className="stoic-breathing__steps">
            <span>1. Inspirar</span>
            <span>2. Segurar</span>
            <span>3. Soltar</span>
            <span>4. Pausar</span>
          </div>
        </div>
      </Modal>

      <div className="module-panel-grid module-panel-grid--4" style={{ marginBottom: '24px' }}>
        <div className="card stoic-stat-card" onClick={() => setActiveModule('languages')} style={{ cursor: 'pointer' }}>
          <div className="stoic-stat-card__head">
            <span>ESTUDO DE IDIOMAS</span>
            <Languages size={18} color="var(--accent-primary)" />
          </div>
          <div className="stoic-stat-card__body">
            <Flame size={28} color="#f97316" />
            <div>
              <div className="stoic-stat-value">{state.languages.currentStreak} dias</div>
              <span style={{ color: state.languages.todayStudied ? 'var(--success)' : 'var(--warning)' }}>
                {state.languages.todayStudied ? '✓ Checklist de hoje feita' : '⚠️ Checklist pendente'}
              </span>
            </div>
          </div>
        </div>

        <div className="card stoic-stat-card" onClick={() => setActiveModule('tasks')} style={{ cursor: 'pointer' }}>
          <div className="stoic-stat-card__head">
            <span>TAREFAS PENDENTES</span>
            <CheckSquare size={18} color="var(--info)" />
          </div>
          <div className="stoic-stat-card__body">
            <div className="stoic-stat-value">{pendingTasks.length}</div>
            <span>tarefas para hoje</span>
          </div>
        </div>

        <div className="card stoic-stat-card" onClick={() => setActiveModule('github')} style={{ cursor: 'pointer' }}>
          <div className="stoic-stat-card__head">
            <span>GITHUB @LIPPDEV</span>
            <GitPullRequest size={18} color="var(--success)" />
          </div>
          <div className="stoic-stat-card__body">
            <div className="stoic-stat-value">{state.github.prs.length}</div>
            <span>PRs ativos</span>
          </div>
        </div>

        <div className="card stoic-stat-card" onClick={() => setActiveModule('mood')} style={{ cursor: 'pointer' }}>
          <div className="stoic-stat-card__head">
            <span>NÍVEL DE HUMOR</span>
            <Smile size={18} color="var(--warning)" />
          </div>
          <div className="stoic-stat-card__body">
            <div className="stoic-stat-value" style={{ color: 'var(--warning)' }}>{state.mood.todayScore} / 5</div>
            <span>check-in de hoje</span>
          </div>
        </div>
      </div>

      <div className="module-panel-grid module-panel-grid--2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Tarefas Prioritárias</h3>
            <button className="topbar-btn" onClick={() => setActiveModule('tasks')} style={{ padding: '4px 10px', fontSize: '12px' }}>
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingTasks.map((t) => (
              <div key={t.id} className="stoic-list-item">
                <div>
                  <h4>{t.title}</h4>
                  <span>{t.category} · {t.dueDate}</span>
                </div>
                <span className="stoic-pill stoic-pill--danger">{t.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Atividade GitHub Recente</h3>
            <button className="topbar-btn" onClick={() => setActiveModule('github')} style={{ padding: '4px 10px', fontSize: '12px' }}>
              Ver tudo <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentPrs.map((pr) => (
              <div key={pr.id} className="stoic-list-item">
                <div>
                  <h4>{pr.title}</h4>
                  <span>{pr.repo}#{pr.prNumber}</span>
                </div>
                <span className="stoic-pill stoic-pill--success">{pr.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
