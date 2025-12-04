import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

// Initialize messaging only if supported (browser environment)
export async function initializeMessaging(): Promise<ReturnType<typeof getMessaging> | null> {
  if (messaging) return messaging;
  
  try {
    const supported = await isSupported();
    if (supported && typeof window !== 'undefined') {
      messaging = getMessaging(app);
      console.log('Firebase Cloud Messaging initialized');
      return messaging;
    }
  } catch (error) {
    console.warn('Firebase Messaging not supported:', error);
  }
  return null;
}

// Get FCM token for this device
export async function getFCMToken(): Promise<string | null> {
  try {
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) {
      console.warn('Messaging not available');
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VAPID key not configured');
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey });
    if (token) {
      console.log('FCM Token obtained:', token);
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Handle foreground messages (when app is open)
export async function onForegroundMessage(callback: (payload: any) => void) {
  try {
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) return null;

    return onMessage(messagingInstance, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return null;
  }
}

export default app;

