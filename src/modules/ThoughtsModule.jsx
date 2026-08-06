import React, { useMemo, useState } from 'react';
import { Feather, Plus, Sparkles, Trash2 } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { saveStore } from '../services/store.js';

const JOURNAL_PROMPTS = [
  {
    key: 'manha',
    label: 'Manhã',
    title: 'Reflexão da manhã',
    tag: 'Manhã',
    starter: 'Hoje eu quero prestar atenção em...'
  },
  {
    key: 'noite',
    label: 'Noite',
    title: 'Revisão da noite',
    tag: 'Noite',
    starter: 'No fim do dia, eu posso soltar...'
  },
  {
    key: 'gratidao',
    label: 'Gratidão',
    title: 'Três coisas boas',
    tag: 'Gratidão',
    starter: 'Hoje eu agradeço por...'
  },
  {
    key: 'obstaculo',
    label: 'Obstáculo',
    title: 'O que pesou',
    tag: 'Clareza',
    starter: 'O principal obstáculo de hoje foi...'
  }
];

export default function ThoughtsModule({ state, setState }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(JOURNAL_PROMPTS[0]);
  const [title, setTitle] = useState(JOURNAL_PROMPTS[0].title);
  const [content, setContent] = useState(JOURNAL_PROMPTS[0].starter);
  const [tag, setTag] = useState(JOURNAL_PROMPTS[0].tag);

  const sortedThoughts = useMemo(() => state.thoughts, [state.thoughts]);

  const openPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setTitle(prompt.title);
    setContent(prompt.starter);
    setTag(prompt.tag);
    setIsCreateOpen(true);
  };

  const openBlankEntry = () => {
    const fallback = JOURNAL_PROMPTS[0];
    setSelectedPrompt(fallback);
    setTitle('');
    setContent('');
    setTag(fallback.tag);
    setIsCreateOpen(true);
  };

  const handleAddThought = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newThought = {
      id: 'th_' + Date.now(),
      title: title.trim() || selectedPrompt.title,
      content: content.trim(),
      tag: tag.trim() || selectedPrompt.tag,
      prompt: selectedPrompt.key,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updated = {
      ...state,
      thoughts: [newThought, ...state.thoughts]
    };
    setState(updated);
    saveStore(updated);
    setTitle('');
    setContent('');
    setTag(selectedPrompt.tag);
    setIsCreateOpen(false);
  };

  const handleDeleteThought = (id) => {
    const updated = {
      ...state,
      thoughts: state.thoughts.filter((t) => t.id !== id)
    };
    setState(updated);
    saveStore(updated);
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Diário guiado</h1>
          <p className="page-subtitle">Feito para escrever rápido, com direção, sem cair no branco do “o que eu coloco aqui?”.</p>
        </div>
        <button className="topbar-btn btn-primary" onClick={openBlankEntry}>
          <Plus size={16} />
          <span>Novo registro</span>
        </button>
      </div>

      <div className="stoic-hero card" style={{ marginBottom: '24px' }}>
        <div className="stoic-hero__copy">
          <span className="stoic-kicker">REFLEXÃO</span>
          <h2>Uma pergunta boa vale mais que uma tela cheia.</h2>
          <p>Escolha um ponto de partida e escreva sem enfeite. O objetivo aqui é clareza, não performance.</p>
        </div>
        <div className="stoic-hero__actions">
          {JOURNAL_PROMPTS.map((prompt) => (
            <button key={prompt.key} type="button" className="stoic-ritual-card" onClick={() => openPrompt(prompt)}>
              <div className="stoic-ritual-card__icon"><Sparkles size={18} /></div>
              <div>
                <strong>{prompt.label}</strong>
                <span>{prompt.starter}</span>
              </div>
              <Feather size={16} />
            </button>
          ))}
        </div>
      </div>

      <Modal
        open={isCreateOpen}
        title="Novo registro guiado"
        onClose={() => setIsCreateOpen(false)}
        width="720px"
        footer={(
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" className="topbar-btn" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
            <button type="submit" form="thought-form" className="topbar-btn btn-primary">Salvar diário</button>
          </div>
        )}
      >
        <form id="thought-form" onSubmit={handleAddThought} className="module-form-grid module-form-grid--2">
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Prompt</label>
            <div className="chip-row">
              {JOURNAL_PROMPTS.map((prompt) => (
                <button
                  key={prompt.key}
                  type="button"
                  className={`chip ${selectedPrompt.key === prompt.key ? 'is-active' : ''}`}
                  onClick={() => openPrompt(prompt)}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Título</label>
            <input
              type="text"
              placeholder="Ex: O que pesou hoje"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="settings-input"
            />
          </div>

          <div>
            <label className="form-label">Tag</label>
            <input
              type="text"
              placeholder="Ex: Trabalho, Noite, Clareza"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="settings-input"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Escrita</label>
            <textarea
              rows="5"
              placeholder={selectedPrompt.starter}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="settings-input"
              style={{ resize: 'vertical', minHeight: '160px' }}
            />
          </div>
        </form>
      </Modal>

      <div className="stoic-insight-strip">
        <div className="stoic-insight-card">
          <span>Entradas</span>
          <strong>{state.thoughts.length}</strong>
        </div>
        <div className="stoic-insight-card">
          <span>Último tema</span>
          <strong>{sortedThoughts[0]?.tag || '—'}</strong>
        </div>
        <div className="stoic-insight-card">
          <span>Foco</span>
          <strong>{sortedThoughts[0]?.prompt ? 'Guiado' : 'Livre'}</strong>
        </div>
      </div>

      <div className="module-panel-grid module-panel-grid--3">
        {sortedThoughts.map((th) => (
          <div key={th.id} className="card stoic-journal-card">
            <div className="stoic-journal-card__head">
              <span className="stoic-pill stoic-pill--accent">{th.tag}</span>
              <button
                type="button"
                onClick={() => handleDeleteThought(th.id)}
                className="icon-btn"
                aria-label="Excluir registro"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <h4>{th.title}</h4>
            <p>{th.content}</p>
            <div className="stoic-journal-card__foot">
              <span>{th.date}</span>
              <span>{th.prompt ? 'guiado' : 'livre'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
