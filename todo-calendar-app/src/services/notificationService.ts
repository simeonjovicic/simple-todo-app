import { LocalNotifications } from '@capacitor/local-notifications';
import type { Exam } from '../models/Exam';

// Helper function to get notification message based on exam date
function getNotificationMessage(examDate: Date): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const examDateOnly = new Date(examDate);
  examDateOnly.setHours(0, 0, 0, 0);
  
  const diffTime = examDateOnly.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else {
    return `in ${diffDays} days`;
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

    // Schedule notification 1 day before the exam (default)
    const notificationDate = new Date(examDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    notificationDate.setHours(9, 0, 0, 0); // 9 AM the day before

    // If the notification time is in the past, schedule for 1 hour before exam
    if (notificationDate < now) {
      const oneHourBefore = new Date(examDate.getTime() - 60 * 60 * 1000);
      // Only schedule if it's still in the future
      if (oneHourBefore > now) {
        notificationDate.setTime(oneHourBefore.getTime());
      } else {
        // Exam is too soon, don't schedule
        return;
      }
    }

    // Use exam ID as notification ID (for cancellation later)
    const notificationId = exam.id ? parseInt(exam.id.slice(-8), 16) % 2147483647 : Date.now();

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Exam Reminder',
          body: `${exam.title}${exam.subject ? ` (${exam.subject})` : ''} is ${getNotificationMessage(examDate)}`,
          id: notificationId,
          schedule: { at: notificationDate },
          sound: 'default',
          extra: {
            examId: exam.id,
            examTitle: exam.title
          }
        }
      ]
    });

    console.log(`Scheduled notification for exam: ${exam.title} on ${notificationDate.toLocaleString()}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

// Cancel notification for an exam
export async function cancelExamNotification(examId: string): Promise<void> {
  try {
    // Convert exam ID to notification ID (same logic as scheduling)
    const notificationId = parseInt(examId.slice(-8), 16) % 2147483647;
    
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }]
    });

    console.log(`Cancelled notification for exam ID: ${examId}`);
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

