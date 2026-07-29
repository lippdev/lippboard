// Goals and Habits Tracker Service (Local Fallback with Extension Points)
import { getStore, saveStore } from './store.js';

/**
 * Fetch all goals.
 */
export async function getGoals() {
  const state = getStore();
  return state.goals || [];
}

/**
 * Add a new goal.
 * @param {object} goal - { title, category, target, current, unit }
 */
export async function addGoal(goal) {
  const store = getStore();
  const newGoal = {
    id: 'g_' + Date.now(),
    title: goal.title,
    category: goal.category || 'Geral',
    target: parseInt(goal.target) || 10,
    current: parseInt(goal.current) || 0,
    unit: goal.unit || 'dias'
  };

  const updated = {
    ...store,
    goals: [...(store.goals || []), newGoal]
  };

  saveStore(updated);
  return { updatedState: updated, goal: newGoal };
}

/**
 * Update the current progress of a goal.
 * @param {string} id - Goal ID.
 * @param {number} newProgress - The new progress value.
 */
export async function updateGoalProgress(id, newProgress) {
  const store = getStore();
  const updated = {
    ...store,
    goals: (store.goals || []).map(g => {
      if (g.id === id) {
        const val = Math.max(0, Math.min(g.target, newProgress));
        return { ...g, current: val };
      }
      return g;
    })
  };

  saveStore(updated);
  return { updatedState: updated };
}

/**
 * Delete a goal.
 * @param {string} id - Goal ID.
 */
export async function deleteGoal(id) {
  const store = getStore();
  const updated = {
    ...store,
    goals: (store.goals || []).filter(g => g.id !== id)
  };

  saveStore(updated);
  return { updatedState: updated };
}
