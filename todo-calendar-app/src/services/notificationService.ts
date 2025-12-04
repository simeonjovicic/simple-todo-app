import { LocalNotifications } from '@capacitor/local-notifications';
import type { Exam } from '../models/Exam';
import { storeExamNotificationSchedules, deleteExamNotificationSchedules } from './examNotificationScheduleService';
import { initializeFCM, getStoredFCMToken, requestPermissionAndInitializeFCM } from './fcmTokenService';
import { onForegroundMessage } from './firebase';

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

// Request notification permissions (for both FCM and local notifications)
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    let hasPermission = false;

    // Request browser notification permission (required for FCM and web notifications)
    if (typeof Notification !== 'undefined') {
      const browserPermission = await Notification.requestPermission();
      if (browserPermission === 'granted') {
        hasPermission = true;
        console.log('Browser notification permission granted');
      } else {
        console.warn('Browser notification permission not granted:', browserPermission);
      }
    }

    // Also request Capacitor local notification permission (for native apps)
    try {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display === 'granted') {
        hasPermission = true;
        console.log('Capacitor local notification permission granted');
      } else {
        const requestResult = await LocalNotifications.requestPermissions();
        if (requestResult.display === 'granted') {
          hasPermission = true;
          console.log('Capacitor local notification permission granted');
        }
      }
    } catch (error) {
      // Local notifications might not be available in web, that's okay
      console.warn('Local notifications not available (this is normal in web browsers):', error);
    }

    // Initialize FCM and store token (if browser permission granted)
    if (hasPermission) {
      try {
        await initializeFCM();
      } catch (error) {
        console.warn('FCM initialization failed, but local notifications may still work:', error);
      }
    }
    
    return hasPermission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Schedule a notification for an exam
// This now stores schedules in Firestore for Cloud Functions to send via FCM
export async function scheduleExamNotification(exam: Exam): Promise<void> {
  try {
    // Check if notifications are enabled for this exam
    if (!exam.notificationEnabled) {
      return;
    }

    // Store notification schedules in Firestore for Cloud Functions
    // Cloud Functions will send FCM notifications at the scheduled times
    await storeExamNotificationSchedules(exam);

    // Also schedule local notifications as a fallback
    // These work on native apps (Android/iOS) and provide immediate feedback
    try {
      const examDate = exam.date instanceof Date 
        ? exam.date 
        : exam.date.toDate ? exam.date.toDate() : new Date(exam.date);
      
      const now = new Date();
      if (examDate < now) {
        return;
      }

      const daysBefore = getNotificationSettings();
      const notifications = [];
      const examDateOnly = new Date(examDate);
      examDateOnly.setHours(0, 0, 0, 0);

      for (let i = 0; i < daysBefore.length; i++) {
        const days = daysBefore[i];
        if (days < 0 || days > 365) continue;

        const notificationDate = new Date(examDateOnly);
        notificationDate.setDate(notificationDate.getDate() - days);
        notificationDate.setHours(9, 0, 0, 0);

        if (notificationDate < now) {
          continue;
        }

        const baseId = exam.id ? parseInt(exam.id.slice(-8), 16) % 2147483647 : Date.now();
        const notificationId = baseId + i;

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
        // Check if Capacitor Local Notifications is available
        try {
          const permission = await LocalNotifications.checkPermissions();
          if (permission.display === 'granted') {
            await LocalNotifications.schedule({ notifications });
            console.log(`✅ Scheduled ${notifications.length} local notification(s) as fallback for exam: ${exam.title}`);
          } else {
            console.log('⚠️ Local notifications permission not granted, skipping local notifications');
          }
        } catch (error) {
          // This is expected in web browsers - Capacitor plugins don't work in web
          console.log('ℹ️ Local notifications not available (normal in web browsers, FCM will handle it)');
        }
      }
    } catch (error) {
      // Local notifications might fail, but FCM schedules are still stored
      console.warn('Error scheduling local notifications (FCM schedules still stored):', error);
    }

    console.log(`Stored FCM notification schedules for exam: ${exam.title}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

// Cancel notification for an exam
export async function cancelExamNotification(examId: string): Promise<void> {
  try {
    // Delete FCM notification schedules from Firestore
    await deleteExamNotificationSchedules(examId);

    // Also cancel local notifications
    try {
      const pending = await LocalNotifications.getPending();
      const examNotifications = pending.notifications.filter(notif => 
        notif.extra?.examId === examId
      );

      if (examNotifications.length > 0) {
        const ids = examNotifications.map(n => n.id);
        await LocalNotifications.cancel({
          notifications: ids.map(id => ({ id }))
        });
        console.log(`Cancelled ${ids.length} local notification(s) for exam ID: ${examId}`);
      }
    } catch (error) {
      console.warn('Error cancelling local notifications:', error);
    }

    console.log(`Cancelled FCM notification schedules for exam ID: ${examId}`);
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

    // Try to initialize FCM if permission already granted (don't request permission here)
    await initializeFCM();

  for (const exam of exams) {
    if (exam.notificationEnabled) {
      await scheduleExamNotification(exam);
    }
  }
}

// Initialize FCM (without requesting permission - for when permission already granted)
export async function initializeNotifications(): Promise<void> {
  try {
    // Only initialize if permission is already granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      await initializeFCM();
      
      // Set up foreground message handler
      onForegroundMessage((payload) => {
        console.log('Foreground FCM message received:', payload);
        // You can show a toast or update UI here
      });
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

// Request permission and initialize FCM (call from user gesture)
export async function requestPermissionAndSetupFCM(): Promise<boolean> {
  try {
    const token = await requestPermissionAndInitializeFCM();
    if (token) {
      // Set up foreground message handler
      onForegroundMessage((payload) => {
        console.log('Foreground FCM message received:', payload);
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting up FCM:', error);
    return false;
  }
}

// Test FCM/Cloud notification (requires permission)
export async function sendTestCloudNotification(): Promise<void> {
  try {
    // Request permission if not granted
    if (typeof Notification !== 'undefined') {
      const permission = Notification.permission;
      if (permission !== 'granted') {
        const newPermission = await Notification.requestPermission();
        if (newPermission !== 'granted') {
          throw new Error('Notification permission not granted. Please allow notifications.');
        }
      }
    }

    // Initialize FCM and get token
    const token = await requestPermissionAndInitializeFCM();
    if (!token) {
      // Check if it's a storage error vs token generation error
      const hasPermission = typeof Notification !== 'undefined' && Notification.permission === 'granted';
      if (hasPermission) {
        // Permission granted but token storage failed - this is likely a Firestore rules issue
        throw new Error('FCM token generated but storage failed. Please update Firestore security rules to allow writes to "fcmTokens" collection. See console for details.');
      } else {
        throw new Error('Failed to get FCM token. Please check your Firebase configuration.');
      }
    }

    // Show browser notification to test
    if (typeof Notification !== 'undefined') {
      const notification = new Notification('FCM Test Notification', {
        body: `FCM Token: ${token.substring(0, 20)}...\n\nThis confirms FCM is set up. Cloud Functions can now send notifications to this device! 🎉`,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'fcm-test',
        requireInteraction: true
      });

      console.log('✅ FCM Token:', token);
      console.log('✅ FCM notification test sent. Token stored in Firestore.');
    }

    return Promise.resolve();
  } catch (error: any) {
    console.error('Error sending FCM test notification:', error);
    throw error;
  }
}

// Test notification - sends immediately (for testing purposes)
// Tries both local notifications and browser notifications
export async function sendTestNotification(): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Notification permission not granted. Please allow notifications in your browser settings.');
    }

    const testId = Date.now() % 2147483647;
    const now = new Date();
    now.setSeconds(now.getSeconds() + 2); // 2 seconds from now

    let notificationScheduled = false;

    // Try Capacitor Local Notifications first (for native apps)
    try {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Test Notification',
              body: 'This is a test notification! If you see this, local notifications are working! 🎉',
              id: testId,
              schedule: { at: now },
              sound: 'default',
              extra: {
                test: true
              }
            }
          ]
        });
        notificationScheduled = true;
        console.log('✅ Test notification scheduled via LocalNotifications for', now.toLocaleString());
      }
    } catch (error) {
      console.log('ℹ️ Local notifications not available (normal in web browsers)');
    }

    // Fallback to browser notifications (for web)
    if (!notificationScheduled && typeof Notification !== 'undefined') {
      try {
        // Create a browser notification immediately for testing
        const notification = new Notification('Test Notification', {
          body: 'This is a test notification! If you see this, browser notifications are working! 🎉',
          icon: '/favicon.png',
          badge: '/favicon.png',
          tag: 'test-notification',
          requireInteraction: false
        });

        // Also schedule one for 2 seconds from now
        setTimeout(() => {
          new Notification('Test Notification (Scheduled)', {
            body: 'This is a scheduled test notification! Browser notifications are working! 🎉',
            icon: '/favicon.png',
            badge: '/favicon.png',
            tag: 'test-notification-scheduled',
            requireInteraction: false
          });
        }, 2000);

        notificationScheduled = true;
        console.log('✅ Test notification sent via browser Notification API');
      } catch (error) {
        console.warn('Browser Notification API failed:', error);
      }
    }

    if (!notificationScheduled) {
      throw new Error('No notification method available. Please check your browser/device settings.');
    }

    return Promise.resolve();
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}

