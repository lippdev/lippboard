export const createDefaultState = () => ({
  user: {
    name: '',
    handle: '',
    email: '',
    avatar: '',
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
    targetMinutes: 0,
    todayMinutes: 0,
    languagesList: [],
    history: []
  },
  tasks: [],
  thoughts: [],
  goals: [],
  calendar: [],
  notifications: {
    enabled: false,
    permission: 'default'
  },
  mood: {
    todayScore: 0,
    todayNote: '',
    history: []
  },
  files: [],
  subagentLogs: [],
  security: {
    enabled: false,
    passwordHash: '',
    passwordSalt: '',
    biometricsEnabled: false,
    webAuthnCredentialId: null,
    autoLockOnHide: true
  },
  auth: {
    username: '',
    displayName: '',
    lastLoginAt: '',
    rememberSession: true,
    passkeyRegistered: false
  }
});

export const DEFAULT_STATE_VERSION = 5;
