const DEFAULT_ICON = '/favicon.svg';

export const supportsNotifications = () => typeof window !== 'undefined' && 'Notification' in window;

export const getNotificationPermission = () => (supportsNotifications() ? Notification.permission : 'unsupported');

export const requestNotificationPermission = async () => {
  if (!supportsNotifications()) {
    throw new Error('Este navegador não suporta notificações web.');
  }

  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
};

export const sendAppNotification = async ({ title, body = '', icon = DEFAULT_ICON }) => {
  if (!supportsNotifications() || Notification.permission !== 'granted') return false;

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, { body, icon, badge: icon });
        return true;
      }
    } catch {
      // fallback below
    }
  }

  new Notification(title, { body, icon, badge: icon });
  return true;
};
