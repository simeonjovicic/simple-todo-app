import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getFCMToken } from './firebase';

const FCM_TOKENS_COLLECTION = 'fcmTokens';

// Store FCM token in Firestore for Cloud Functions to use
export async function storeFCMToken(): Promise<string | null> {
  let token: string | null = null;
  try {
    token = await getFCMToken();
    if (!token) {
      console.warn('No FCM token available to store');
      return null;
    }

    // Store token in Firestore (using token as document ID for easy lookup)
    const tokenRef = doc(db, FCM_TOKENS_COLLECTION, token);
    await setDoc(tokenRef, {
      token,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      platform: typeof window !== 'undefined' ? 'web' : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    }, { merge: true });

    console.log('✅ FCM token stored in Firestore');
    return token;
  } catch (error: any) {
    console.error('❌ Error storing FCM token:', error);
    if (error?.code === 'permission-denied') {
      console.warn('⚠️ Firestore permission denied. Please update Firestore security rules to allow writes to "fcmTokens" collection.');
      console.warn('📝 See FIRESTORE_RULES_UPDATE.md for instructions.');
    }
    // Return token even if storage failed - token is still valid for FCM
    return token; // Return token anyway, storage failure doesn't mean token is invalid
  }
}

// Get stored FCM token
export async function getStoredFCMToken(): Promise<string | null> {
  try {
    const token = await getFCMToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Initialize FCM and store token (requires user gesture for permission)
export async function initializeFCM(): Promise<string | null> {
  try {
    // Check if permission is already granted (don't request if not - must be user gesture)
    if (typeof Notification !== 'undefined') {
      const permission = Notification.permission;
      if (permission !== 'granted') {
        console.warn('Notification permission not granted. User must grant permission via button click.');
        return null;
      }
    }

    // Get and store FCM token
    const token = await storeFCMToken();
    return token;
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return null;
  }
}

// Request permission and initialize FCM (call this from user gesture)
export async function requestPermissionAndInitializeFCM(): Promise<string | null> {
  try {
    // Request notification permission (this must be called from user gesture)
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }
    }

    // Get and store FCM token
    const token = await storeFCMToken();
    return token;
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return null;
  }
}

