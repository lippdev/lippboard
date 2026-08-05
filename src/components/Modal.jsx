import React, { useEffect } from 'react';

export default function Modal({ open, title, children, footer, onClose, width = '640px' }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="app-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <section className="app-modal" role="dialog" aria-modal="true" aria-label={title} style={{ width }}>
        <header className="app-modal-header">
          <div>
            <h3 className="app-modal-title">{title}</h3>
          </div>
          <button type="button" className="topbar-btn" onClick={onClose}>Fechar</button>
        </header>

        <div className="app-modal-body">{children}</div>

        {footer && <footer className="app-modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}
