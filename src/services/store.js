// Lipp Board - Initial Data Store & Local Storage Service
import { createDefaultState } from './defaultState.js';
import { saveRemoteState, fetchRemoteState } from './backendService.js';

const STORAGE_KEY = 'lippboard_pwa_data_v4';
const LEGACY_STORAGE_KEYS = ['lippboard_pwa_data_v1', 'lippboard_pwa_data_v2', 'lippboard_pwa_data_v3'];


const stripDeprecatedFields = (state) => {
  const { security, ...rest } = state || {};
  return rest;
};


export const getStore = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!saved) {
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      const initialState = createDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
      return initialState;
    }

    const parsed = JSON.parse(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    const legacySecurity = parsed.security || {};
    const migratedSecurity = {
      ...createDefaultState().security,
      ...legacySecurity,
      passwordHash: legacySecurity.passwordHash || legacySecurity.pinHash || createDefaultState().security.passwordHash,
      passwordSalt: legacySecurity.passwordSalt || createDefaultState().security.passwordSalt,
      enabled: Boolean(legacySecurity.enabled && (legacySecurity.passwordHash || legacySecurity.pinHash)),
    };

    return stripDeprecatedFields({
      ...createDefaultState(),
      ...parsed,
      security: migratedSecurity,
      github: {
        ...createDefaultState().github,
        ...(parsed.github || {})
      },
      languages: {
        ...createDefaultState().languages,
        ...(parsed.languages || {}),
        languagesList: parsed.languages?.languagesList || createDefaultState().languages.languagesList,
        history: parsed.languages?.history || []
      },
      mood: {
        ...createDefaultState().mood,
        ...(parsed.mood || {}),
        history: parsed.mood?.history || []
      },
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : createDefaultState().tasks,
      thoughts: Array.isArray(parsed.thoughts) ? parsed.thoughts : createDefaultState().thoughts,
      goals: Array.isArray(parsed.goals) ? parsed.goals : createDefaultState().goals,
      calendar: Array.isArray(parsed.calendar) ? parsed.calendar : createDefaultState().calendar,
      files: Array.isArray(parsed.files) ? parsed.files : createDefaultState().files,
      subagentLogs: Array.isArray(parsed.subagentLogs) ? parsed.subagentLogs : createDefaultState().subagentLogs
    });
  } catch (err) {
    console.error('Erro ao ler estado do localStorage:', err);
    return createDefaultState();
  }
};

export const saveStore = (state) => {
  try {
    const sanitized = stripDeprecatedFields(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    void saveRemoteState(sanitized);
  } catch (err) {
    console.error('Erro ao salvar estado no localStorage:', err);
  }
};

export const loadRemoteStore = async () => {
  try {
    const remoteState = await fetchRemoteState();
    if (remoteState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
      return remoteState;
    }
  } catch (err) {
    console.warn('Falha ao carregar estado remoto:', err);
  }
  return getStore();
};

export const clearStore = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (err) {
    console.error('Erro ao limpar store local:', err);
  }
};
