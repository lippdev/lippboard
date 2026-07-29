// Calendar Integration Service (Local Fallback with Extension Points)
import { getStore, saveStore } from './store.js';

/**
 * Fetch calendar events. Currently returns from local state, 
 * but prepared for Google Calendar API fetch.
 */
export async function getEvents() {
  const state = getStore();
  return state.calendar || [];
}

/**
 * Save a new calendar event.
 * @param {object} event - { title, time, date, type }
 */
export async function addEvent(event) {
  const store = getStore();
  const newEvent = {
    id: 'c_' + Date.now(),
    title: event.title,
    time: event.time || 'O dia todo',
    date: event.date || 'Hoje',
    type: event.type || 'pessoal'
  };

  const updated = {
    ...store,
    calendar: [...(store.calendar || []), newEvent]
  };

  saveStore(updated);
  return { updatedState: updated, event: newEvent };
}

/**
 * Delete a calendar event.
 * @param {string} id - Event ID.
 */
export async function deleteEvent(id) {
  const store = getStore();
  const updated = {
    ...store,
    calendar: (store.calendar || []).filter(e => e.id !== id)
  };

  saveStore(updated);
  return { updatedState: updated };
}
