import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bot, Download, CheckCircle2 } from 'lucide-react';

export default function Topbar({ activeModule, theme, setTheme, onOpenDrawer, isPwaInstalled, onInstallPwa }) {
  const [dateTimeStr, setDateTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      setDateTimeStr(now.toLocaleDateString('pt-BR', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const getModuleName = () => {
    const map = {
      home: 'Início',
      inbox: 'Caixa de Entrada',
      activity: 'Atividades',
      tags: 'Tags',
      thoughts: 'Pensamentos',
      tasks: 'Tarefas',
      languages: 'Estudo de Idiomas',
      calendar: 'Calendário',
      goals: 'Metas',
      github: 'GitHub',
      fileboard: 'Arquivos',
      mood: 'Humor',
      agentbridge: 'Ponte do Subagente',
      settings: 'Configurações'
    };
    return map[activeModule] || 'Início';
  };

  return (
    <header className="app-topbar">
      <div className="topbar-breadcrumb">
        <span>Lipp Board</span>
        <span>/</span>
        <span className="topbar-breadcrumb-item">{getModuleName()}</span>
        <span className="topbar-badge">9 módulos</span>
      </div>

      <div className="topbar-actions">
        <div className="topbar-clock">
          <span>{dateTimeStr}</span>
        </div>

        <button 
          className="topbar-btn" 
          title="Alternar Tema"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {!isPwaInstalled && onInstallPwa && (
          <button className="topbar-btn" onClick={onInstallPwa} title="Instalar PWA">
            <Download size={16} />
            <span>Instalar PWA</span>
          </button>
        )}

        <button className="topbar-btn btn-primary" onClick={onOpenDrawer}>
          <Bot size={16} />
          <span>Comando IA</span>
        </button>
      </div>
    </header>
  );
}
