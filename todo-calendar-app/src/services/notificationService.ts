import { LocalNotifications } from '@capacitor/local-notifications';
import type { Exam } from '../models/Exam';

// Get notification settings
function getNotificationSettings() {
  try {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.daysBefore || [7, 3];
    }
  } catch (error) {
    console.warn('Failed to load notification settings:', error);
  }
  return [7, 3]; // Default fallback
}

// Helper function to get notification message based on exam date and days before
function getNotificationMessage(examDate: Date, daysBefore: number): string {
  if (daysBefore === 0) {
    return 'today';
  } else if (daysBefore === 1) {
    return 'tomorrow';
  } else {
    return `in ${daysBefore} days`;
  }
}

// Request notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const permission = await LocalNotifications.checkPermissions();
    
    if (permission.display === 'granted') {
      return true;
    }
    
    const requestResult = await LocalNotifications.requestPermissions();
    return requestResult.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Schedule a notification for an exam
export async function scheduleExamNotification(exam: Exam): Promise<void> {
  try {
    // Check if notifications are enabled for this exam
    if (!exam.notificationEnabled) {
      return;
    }

    // Get exam date
    const examDate = exam.date instanceof Date 
      ? exam.date 
      : exam.date.toDate ? exam.date.toDate() : new Date(exam.date);
    
    // Don't schedule notifications for past exams
    const now = new Date();
    if (examDate < now) {
      return;
    }

    // Get settings from localStorage
    const daysBefore = getNotificationSettings();

    // Schedule notifications for each day before
    const notifications = [];
    const examDateOnly = new Date(examDate);
    examDateOnly.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysBefore.length; i++) {
      const days = daysBefore[i];
      if (days < 0 || days > 365) continue; // Skip invalid days

      const notificationDate = new Date(examDateOnly);
      notificationDate.setDate(notificationDate.getDate() - days);
      notificationDate.setHours(9, 0, 0, 0); // 9 AM

      // Skip if notification time is in the past
      if (notificationDate < now) {
        continue;
      }

      // Generate unique notification ID for each reminder
      const baseId = exam.id ? parseInt(exam.id.slice(-8), 16) % 2147483647 : Date.now();
      const notificationId = baseId + i; // Make each notification unique

      notifications.push({
        title: 'Exam Reminder',
        body: `${exam.title}${exam.subject ? ` (${exam.subject})` : ''} is ${getNotificationMessage(examDate, days)}`,
        id: notificationId,
        schedule: { at: notificationDate },
        sound: 'default',
        extra: {
          examId: exam.id,
          examTitle: exam.title,
          daysBefore: days
        }
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({
        notifications
      });

      console.log(`Scheduled ${notifications.length} notification(s) for exam: ${exam.title}`);
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

// Cancel notification for an exam
export async function cancelExamNotification(examId: string): Promise<void> {
  try {
    // Get all pending notifications
    const pending = await LocalNotifications.getPending();
    
    // Find all notifications for this exam
    const examNotifications = pending.notifications.filter(notif => 
      notif.extra?.examId === examId
    );

    if (examNotifications.length > 0) {
      const ids = examNotifications.map(n => n.id);
      await LocalNotifications.cancel({
        notifications: ids.map(id => ({ id }))
      });

      console.log(`Cancelled ${ids.length} notification(s) for exam ID: ${examId}`);
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
    // Don't throw - it's okay if notification doesn't exist
  }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      const ids = pending.notifications.map(n => n.id);
      await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
    }
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

// Get pending notifications
export async function getPendingNotifications() {
  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications;
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
}

// Schedule notifications for all upcoming exams
export async function scheduleAllExamNotifications(exams: Exam[]): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return;
  }

  for (const exam of exams) {
    if (exam.notificationEnabled) {
      await scheduleExamNotification(exam);
    }
  }
}

// Test notification - sends immediately (for testing purposes)
export async function sendTestNotification(): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }

    const testId = Date.now() % 2147483647;
    const now = new Date();
    now.setSeconds(now.getSeconds() + 2); // 2 seconds from now

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Test Notification',
          body: 'This is a test notification! If you see this, notifications are working! 🎉',
          id: testId,
          schedule: { at: now },
          sound: 'default',
          extra: {
            test: true
          }
        }
      ]
    });

    console.log('Test notification scheduled for', now.toLocaleString());
    return Promise.resolve();
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}

