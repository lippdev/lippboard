// Subagent Bridge Service - Zero API Key & Zero OAuth Execution Engine
import { getStore, saveStore } from './store.js';
import { TASK_STATUS } from './taskStatus.js';

export const processAgentCommand = (commandText) => {
  const store = getStore();
  const lower = commandText.toLowerCase().trim();
  const timestamp = new Date().toLocaleString('pt-BR');

  let resultAction = 'COMANDO_EXECUTADO';
  let detailsText = '';

  // 1. Comando de adicionar tarefa
  if (lower.includes('tarefa') || lower.includes('task') || lower.includes('adicionar tarefa') || lower.includes('criar tarefa')) {
    const cleanTitle = commandText
      .replace(/adicionar tarefa/i, '')
      .replace(/criar tarefa/i, '')
      .replace(/tarefa/i, '')
      .replace(/task/i, '')
      .trim() || 'Nova Tarefa via Subagente';

    const newTask = {
      id: 't_' + Date.now(),
      title: cleanTitle,
      category: 'Subagente',
      priority: lower.includes('alta') ? 'Alta' : lower.includes('baixa') ? 'Baixa' : 'Média',
      status: TASK_STATUS.TODO,
      dueDate: lower.includes('amanhã') ? 'Amanhã' : 'Hoje'
    };

    store.tasks.unshift(newTask);
    resultAction = 'CRIAR_TAREFA';
    detailsText = `Criou a tarefa "${cleanTitle}" com prioridade ${newTask.priority}`;
  }
  // 2. Comando de estudo de idiomas / checklist
  else if (lower.includes('estudei') || lower.includes('idioma') || lower.includes('inglês') || lower.includes('espanhol') || lower.includes('idiomas')) {
    store.languages.todayStudied = true;
    if (!store.languages.history.some(h => h.date === new Date().toISOString().split('T')[0])) {
      store.languages.currentStreak += 1;
    }
    
    // Adiciona ao histórico se houver detalhes
    store.languages.history.unshift({
      date: new Date().toISOString().split('T')[0],
      studied: true,
      minutes: 30,
      topic: commandText,
      language: lower.includes('espanhol') ? 'Espanhol' : 'Inglês'
    });

    resultAction = 'CHECKLIST_IDIOMAS';
    detailsText = `Confirmou estudo de idiomas para hoje! Ofensiva atual: ${store.languages.currentStreak} dias`;
  }
  // 3. Comando de criar nota / pensamento
  else if (lower.includes('nota') || lower.includes('pensamento') || lower.includes('ideia') || lower.includes('anotar')) {
    const cleanNote = commandText
      .replace(/criar nota/i, '')
      .replace(/anotar/i, '')
      .replace(/pensamento/i, '')
      .trim() || 'Nota rápida enviada pelo assistente';

    const newThought = {
      id: 'th_' + Date.now(),
      title: cleanNote.slice(0, 40) + '...',
      content: cleanNote,
      date: new Date().toLocaleDateString('pt-BR'),
      tag: 'IA Subagente'
    };

    store.thoughts.unshift(newThought);
    resultAction = 'CRIAR_PENSAMENTO';
    detailsText = `Salvou nova nota: "${newThought.title}"`;
  }
  // 4. Comando de registrar humor
  else if (lower.includes('humor') || lower.includes('estou feliz') || lower.includes('estou motivado')) {
    const score = lower.includes('ótimo') || lower.includes('feliz') || lower.includes('motivado') ? 5 : 4;
    store.mood.todayScore = score;
    store.mood.todayNote = commandText;

    resultAction = 'REGISTRAR_HUMOR';
    detailsText = `Registrou pontuação de humor ${score}/5 com nota: "${commandText}"`;
  }
  // 5. Fallback para comando geral
  else {
    const defaultTask = {
      id: 't_' + Date.now(),
      title: commandText,
      category: 'Subagente',
      priority: 'Média',
      status: TASK_STATUS.TODO,
      dueDate: 'Hoje'
    };
    store.tasks.unshift(defaultTask);
    resultAction = 'COMANDO_GERAL';
    detailsText = `Processou comando e adicionou à lista de tarefas: "${commandText}"`;
  }

  // Registra no histórico do Subagente
  const logEntry = {
    id: 'l_' + Date.now(),
    timestamp,
    agent: 'Subagente de IA (Gemini / ChatGPT)',
    action: resultAction,
    details: detailsText,
    status: 'sucesso'
  };

  store.subagentLogs.unshift(logEntry);
  saveStore(store);

  return {
    success: true,
    action: resultAction,
    message: detailsText,
    state: store
  };
};
