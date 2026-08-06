import { Home, Inbox, Activity, Tag, Lightbulb, CheckSquare, Languages, Calendar, Target, GitPullRequest, Folder, Smile, Bot, Settings } from 'lucide-react';

export const PRIMARY_ACTIONS = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'thoughts', label: 'Pensamentos', icon: Lightbulb },
  { id: 'mood', label: 'Humor', icon: Smile },
];

export const SIDEBAR_QUICK_ACTIONS = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'inbox', label: 'Caixa de Entrada', icon: Inbox },
  { id: 'activity', label: 'Atividades', icon: Activity },
  { id: 'tags', label: 'Tags', icon: Tag },
];

export const SIDEBAR_MODULES = [
  { id: 'thoughts', label: 'Pensamentos', icon: Lightbulb, badge: '•' },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare, badge: '•' },
  { id: 'languages', label: 'Estudo de Idiomas', icon: Languages, badge: '•' },
  { id: 'calendar', label: 'Calendário', icon: Calendar, badge: '•' },
  { id: 'goals', label: 'Metas', icon: Target, badge: '•' },
  { id: 'github', label: 'GitHub', icon: GitPullRequest, badge: '•' },
  { id: 'fileboard', label: 'Arquivos', icon: Folder, badge: '•' },
  { id: 'mood', label: 'Humor', icon: Smile, badge: '•' },
  { id: 'agentbridge', label: 'Ponte do Subagente', icon: Bot, badge: 'IA' },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const MOBILE_DOCK_ITEMS = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'thoughts', label: 'Notas', icon: Lightbulb },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'mood', label: 'Humor', icon: Smile },
];
