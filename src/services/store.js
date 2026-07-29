// Lipp Board - Initial Data Store & Local Storage Service
const STORAGE_KEY = 'lippboard_pwa_data_v1';

const DEFAULT_STATE = {
  user: {
    name: 'Filipe Moreira',
    handle: 'lippdev',
    email: 'xfilipepenna2@gmail.com',
    avatar: 'https://github.com/lippdev.png',
    githubToken: '',
    lastSynced: '27/07/2026, 20:40:00'
  },
  theme: 'dark',
  github: {
    prs: [
      {
        id: '1',
        title: 'suggestion/refactoring-example',
        repo: 'GPA1992/gorjeta-app-react-native',
        prNumber: '3',
        author: 'lippdev',
        additions: 96,
        deletions: 178,
        filesCount: 6,
        updatedAt: '10/11/2022',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '2',
        title: 'feature',
        repo: 'lippdev/gem-ai',
        prNumber: '1',
        author: 'lippdev',
        additions: 106,
        deletions: 30,
        filesCount: 5,
        updatedAt: '06/05/2024',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '3',
        title: 'chore: initialize tests',
        repo: 'lippdev/recta-backend-app',
        prNumber: '7',
        author: 'lippdev',
        additions: 48694,
        deletions: 5802,
        filesCount: 93,
        updatedAt: '30/01/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '4',
        title: 'feat(frontend): initialize Next.js frontend with TypeScript and Tailwind',
        repo: 'lippdev/teorical-questions-detran',
        prNumber: '1',
        author: 'CelsonF',
        additions: 0,
        deletions: 0,
        filesCount: 0,
        updatedAt: '17/04/2026',
        status: 'IN YOUR REPOS',
        type: 'repos',
        url: 'https://github.com/lippdev'
      },
      {
        id: '5',
        title: 'feat(referrals): referral program and subscription expiration',
        repo: 'lippdev/conduzir-pocket',
        prNumber: '1',
        author: 'lippdev',
        additions: 607,
        deletions: 25,
        filesCount: 5,
        updatedAt: '10/06/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '6',
        title: 'feat(referrals): referral rewards UI and subscription expiration',
        repo: 'lippdev/conduzir-front',
        prNumber: '1',
        author: 'lippdev',
        additions: 651,
        deletions: 74,
        filesCount: 11,
        updatedAt: '10/06/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '7',
        title: 'fix: onboarding, carteira, recuperação de senha e biometria (4 issues)',
        repo: 'lippdev/targa-mobile-app',
        prNumber: '2',
        author: 'lippdev',
        additions: 341,
        deletions: 39,
        filesCount: 18,
        updatedAt: '23/07/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '8',
        title: '[SLICE-18][BOOKING-3673] wire pinch-to-zoom on memberapp',
        repo: 'glofoxinc/glofoxmemberapp',
        prNumber: '1664',
        author: 'lippdev',
        additions: 160,
        deletions: 22,
        filesCount: 4,
        updatedAt: '24/07/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '9',
        title: 'fix: preserve pinch-zoom pan on zoom-out (AC1/AC2)',
        repo: 'glofoxinc/room-layout-map',
        prNumber: '80',
        author: 'lippdev',
        additions: 265,
        deletions: 100,
        filesCount: 4,
        updatedAt: '27/07/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '10',
        title: '[BOOKING-4311] Poll and detect server-assigned spot mid-flow (1/2)',
        repo: 'glofoxinc/glofoxmemberapp',
        prNumber: '1748',
        author: 'lippdev',
        additions: 144,
        deletions: 26,
        filesCount: 6,
        updatedAt: '27/07/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '11',
        title: '[BOOKING-4311] Locked Spot Selection UI and AC2 banner (2/2)',
        repo: 'glofoxinc/glofoxmemberapp',
        prNumber: '1749',
        author: 'lippdev',
        additions: 93,
        deletions: 21,
        filesCount: 7,
        updatedAt: '27/07/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '12',
        title: 'ci: Developer ID signing + notarization for releases',
        repo: 'lippdev/voulum',
        prNumber: '3',
        author: 'lippdev',
        additions: 0,
        deletions: 0,
        filesCount: 0,
        updatedAt: '27/07/2026',
        status: 'AUTHORED',
        type: 'authored',
        url: 'https://github.com/lippdev'
      },
      {
        id: '13',
        title: 'Slice 21 [BOOKING-4174] (1/2) - Added friends spot selection components and utilities',
        repo: 'glofoxinc/room-layout-map',
        prNumber: '78',
        author: 'lkraus-sweatworks',
        additions: 579,
        deletions: 2,
        filesCount: 7,
        updatedAt: '27/07/2026',
        status: 'MENCIONADO',
        type: 'mentioned',
        url: 'https://github.com/lippdev'
      }
    ]
  },
  languages: {
    currentStreak: 12,
    todayStudied: true,
    targetMinutes: 45,
    todayMinutes: 30,
    languagesList: [
      { id: 'en', name: 'Inglês', level: 'Avançado (C1)', active: true, progress: 88 },
      { id: 'es', name: 'Espanhol', level: 'Intermediário (B1)', active: true, progress: 54 },
      { id: 'jp', name: 'Japonês', level: 'Iniciante (N5)', active: false, progress: 18 }
    ],
    history: [
      { date: '2026-07-28', studied: true, minutes: 30, topic: 'Daily conversation & Reading PWA docs', language: 'Inglês' },
      { date: '2026-07-27', studied: true, minutes: 45, topic: 'Gramática e escuta de podcasts', language: 'Inglês' },
      { date: '2026-07-26', studied: true, minutes: 20, topic: 'Vocabulário de tecnologia', language: 'Espanhol' },
      { date: '2026-07-25', studied: true, minutes: 50, topic: 'Expressões idiomáticas', language: 'Inglês' }
    ]
  },
  tasks: [
    { id: 't1', title: 'Implementar PWA Service Worker no Lipp Board', category: 'Dev', priority: 'Alta', status: 'concluida', dueDate: 'Hoje' },
    { id: 't2', title: 'Revisar PR #1749 do Glofox Memberapp', category: 'GitHub', priority: 'Alta', status: 'pendente', dueDate: 'Hoje' },
    { id: 't3', title: 'Estudar 30 minutos de vocabulário técnico em Inglês', category: 'Idiomas', priority: 'Media', status: 'concluida', dueDate: 'Hoje' },
    { id: 't4', title: 'Organizar estrutura do repositório lippdev/lippboard', category: 'Dev', priority: 'Alta', status: 'pendente', dueDate: 'Amanhã' }
  ],
  thoughts: [
    { id: 'th1', title: 'Ideia de Arquitetura PWA Pessoal', content: 'Centralizar todos os dashboards diários em uma webOS leve, utilizando localStorage para cache offline e sincronização rápida.', date: '28/07/2026', tag: 'Arquitetura' },
    { id: 'th2', title: 'Integração de Subagentes de IA', content: 'Permitir que agentes como Gemini ou ChatGPT enviem ações diretas ao app através de uma ponte estruturada de comandos sem necessitar de chaves privadas.', date: '27/07/2026', tag: 'IA' }
  ],
  goals: [
    { id: 'g1', title: 'Manter 30 dias de Ofensiva em Idiomas', category: 'Estudos', current: 12, target: 30, unit: 'dias' },
    { id: 'g2', title: 'Finalizar 15 Pull Requests em Julho', category: 'Dev', current: 13, target: 15, unit: 'PRs' },
    { id: 'g3', title: 'Ler 2 livros técnicos neste trimestre', category: 'Carreira', current: 1, target: 2, unit: 'livros' }
  ],
  calendar: [
    { id: 'c1', title: 'Reunião de Alinhamento de PRs', time: '14:00 - 14:45', date: 'Hoje', type: 'trabalho' },
    { id: 'c2', title: 'Sessão de Prática de Idiomas', time: '19:00 - 19:30', date: 'Hoje', type: 'estudo' },
    { id: 'c3', title: 'Review do Repositório lippboard.git', time: '10:00 - 11:00', date: 'Amanhã', type: 'dev' }
  ],
  mood: {
    todayScore: 5,
    todayNote: 'Dia muito produtivo desenvolvendo o Lipp Board PWA com o assistente!',
    history: [
      { date: '28/07/2026', score: 5, note: 'Ótimo ritmo de código' },
      { date: '27/07/2026', score: 4, note: 'Focado em testes e PRs' },
      { date: '26/07/2026', score: 4, note: 'Descanso e estudos de idiomas' }
    ]
  },
  subagentLogs: [
    { id: 'l1', timestamp: '28/07/2026, 19:42', agent: 'Antigravity Subagent', action: 'INICIALIZOU_APP', details: 'Configurado Lipp Board v0.1 para Filipe Moreira (@lippdev)', status: 'sucesso' }
  ],
  security: {
    enabled: false,
    pinHash: '',
    biometricsEnabled: false,
    webAuthnCredentialId: null,
    autoLockOnHide: false
  }
};

export const getStore = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      security: {
        ...DEFAULT_STATE.security,
        ...(parsed.security || {})
      }
    };
  } catch (err) {
    console.error('Erro ao ler estado do localStorage:', err);
    return DEFAULT_STATE;
  }
};

export const saveStore = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Erro ao salvar estado no localStorage:', err);
  }
};
