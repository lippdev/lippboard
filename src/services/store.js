// Lipp Board - Initial Data Store & Local Storage Service
const STORAGE_KEY = 'lippboard_pwa_data_v1';

const DEFAULT_STATE = {
  user: {
    name: 'Filipe Moreira',
    handle: 'lippdev',
    email: 'xfilipepenna2@gmail.com',
    avatar: 'https://github.com/lippdev.png',
    githubToken: '',
    lastSynced: ''
  },
  theme: 'dark',
  github: {
    prs: [],
    activities: []
  },
  languages: {
    currentStreak: 0,
    todayStudied: false,
    targetMinutes: 45,
    todayMinutes: 0,
    languagesList: [
      { id: 'en', name: 'Inglês', level: 'Avançado (C1)', active: true, progress: 88 },
      { id: 'es', name: 'Espanhol', level: 'Intermediário (B1)', active: true, progress: 54 },
      { id: 'jp', name: 'Japonês', level: 'Iniciante (N5)', active: false, progress: 18 }
    ],
    history: []
  },
  tasks: [],
  thoughts: [],
  goals: [],
  calendar: [],
  mood: {
    todayScore: 3,
    todayNote: '',
    history: []
  },
  files: [],
  subagentLogs: [],
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
      },
      github: {
        ...DEFAULT_STATE.github,
        ...(parsed.github || {})
      },
      languages: {
        ...DEFAULT_STATE.languages,
        ...(parsed.languages || {}),
        languagesList: parsed.languages?.languagesList || DEFAULT_STATE.languages.languagesList,
        history: parsed.languages?.history || []
      },
      mood: {
        ...DEFAULT_STATE.mood,
        ...(parsed.mood || {}),
        history: parsed.mood?.history || []
      },
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : DEFAULT_STATE.tasks,
      thoughts: Array.isArray(parsed.thoughts) ? parsed.thoughts : DEFAULT_STATE.thoughts,
      goals: Array.isArray(parsed.goals) ? parsed.goals : DEFAULT_STATE.goals,
      calendar: Array.isArray(parsed.calendar) ? parsed.calendar : DEFAULT_STATE.calendar,
      files: Array.isArray(parsed.files) ? parsed.files : DEFAULT_STATE.files,
      subagentLogs: Array.isArray(parsed.subagentLogs) ? parsed.subagentLogs : DEFAULT_STATE.subagentLogs
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
