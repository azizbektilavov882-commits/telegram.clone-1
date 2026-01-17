// Browser notification utility
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notificationOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: options.tag || 'telegram-notification',
    requireInteraction: false,
    ...options
  };

  const notification = new Notification(title, notificationOptions);

  notification.onclick = () => {
    window.focus();
    notification.close();
    if (options.onClick) {
      options.onClick();
    }
  };

  // Auto close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);

  return notification;
};

export const showMessageNotification = (message, chatName, onClick) => {
  const title = chatName || 'New message';
  const body = message.text || 'New file';
  
  showNotification(title, {
    body,
    icon: message.sender?.avatar || '/favicon.ico',
    tag: `message-${message.chatId}`,
    onClick
  });
};
