import { useCallback } from 'react';
import { Task } from '../types';

// Use a simple in-memory map to store timeout IDs
const scheduledNotifications = new Map<string, number>();

export const scheduleNotification = (task: Task): string | undefined => {
  if (!task.dueDate || typeof task.reminderOffset === 'undefined' || task.reminderOffset < 0) {
    return undefined;
  }

  const dueDate = new Date(task.dueDate);
  const reminderTime = new Date(dueDate.getTime() - task.reminderOffset * 60 * 1000);
  const now = new Date();

  if (reminderTime <= now) {
    return undefined; // Don't schedule notifications for past events
  }

  const delay = reminderTime.getTime() - now.getTime();
  const reminderId = task.reminderId || `reminder-${task.id}-${Date.now()}`;

  const timeoutId = window.setTimeout(() => {
    new Notification('RERANGE Reminder', {
      body: task.title,
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔁</text></svg>',
    });
    scheduledNotifications.delete(reminderId);
  }, delay);

  scheduledNotifications.set(reminderId, timeoutId);
  return reminderId;
};

export const cancelNotification = (reminderId: string) => {
  if (scheduledNotifications.has(reminderId)) {
    clearTimeout(scheduledNotifications.get(reminderId));
    scheduledNotifications.delete(reminderId);
  }
};

export const useNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  }, []);

  const scheduleAllReminders = useCallback((tasks: Task[]) => {
    tasks.forEach(task => {
        // Only schedule if it's not already scheduled (or handle updates if needed)
        if (task.reminderId && !scheduledNotifications.has(task.reminderId)) {
            scheduleNotification(task);
        }
    });
  }, []);

  return { requestPermission, scheduleAllReminders };
};
