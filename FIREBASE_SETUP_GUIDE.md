# Firebase Setup Guide for Todo Calendar App

## Prerequisites
- Firebase account (free tier is sufficient)
- Node.js and npm installed
- Basic understanding of Firebase services

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project" or "Create a project"
   - Project name: `todo-calendar-app` (or your preferred name)
   - **Disable Google Analytics** (to minimize resource usage)
   - Click "Create project"
   - Wait for project creation (30-60 seconds)

## Step 2: Enable Firestore Database

1. **Navigate to Firestore**
   - In Firebase Console, click "Firestore Database" in left sidebar
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" (we'll secure it later)
   - Click "Next"

3. **Choose Location**
   - Select the region closest to you (e.g., `us-central`, `europe-west`)
   - Click "Enable"
   - Wait for database creation

## Step 3: Enable Cloud Messaging (for Notifications)

1. **Navigate to Cloud Messaging**
   - In Firebase Console, click "Cloud Messaging" in left sidebar
   - If prompted, click "Enable"

2. **Get Server Key** (for later use)
   - Click the gear icon ⚙️ next to "Cloud Messaging"
   - Go to "Cloud Messaging API (Legacy)"
   - Note the "Server key" (we'll use this for push notifications)

## Step 4: Register Web App

1. **Add Web App**
   - In Firebase Console, click the Web icon `</>` or "Add app" → Web
   - App nickname: `todo-calendar-web`
   - Check "Also set up Firebase Hosting" (optional, we won't use it now)
   - Click "Register app"

2. **Copy Firebase Config**
   - You'll see a config object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "todo-calendar-app.firebaseapp.com",
     projectId: "todo-calendar-app",
     storageBucket: "todo-calendar-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   - **Copy this entire config** - we'll use it in the app

## Step 5: Register Android App (for Android builds)

1. **Add Android App**
   - Click "Add app" → Android icon
   - Android package name: `com.yourname.todocalendar` (use your own)
   - App nickname: `todo-calendar-android`
   - Click "Register app"

2. **Download google-services.json**
   - Download the `google-services.json` file
   - **Save this file** - we'll add it to the Android project later
   - Click "Next" through remaining steps

## Step 6: Install Firebase in Your Project

Run these commands in your project directory:

```bash
cd todo-calendar-app
npm install firebase
```

## Step 7: Create Firebase Configuration File

We'll create a `firebase.ts` file in your project with your config. The structure will be:

```typescript
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  // Your config from Step 4 goes here
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
```

## Step 8: Test Connection

We'll create a simple test to verify Firebase connection works.

## Security Rules (To Add Later)

Once we have basic functionality working, we'll add security rules:

1. Go to Firestore → Rules tab
2. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to todos
    match /todos/{todoId} {
      allow read, write: if true; // For MVP, allow all. Secure later.
    }
    // Allow read/write access to exams
    match /exams/{examId} {
      allow read, write: if true; // For MVP, allow all. Secure later.
    }
  }
}
```
3. Click "Publish"

## Next Steps After Setup

1. ✅ Firebase project created
2. ✅ Firestore enabled
3. ✅ Cloud Messaging enabled
4. ✅ Web app registered
5. ✅ Android app registered (if needed)
6. ⏭️ Install Firebase SDK in project
7. ⏭️ Create firebase.ts config file
8. ⏭️ Test connection

## Troubleshooting

**Issue**: "Firebase: Error (auth/unauthorized-domain)"
- **Solution**: Add your domain to Firebase Console → Authentication → Settings → Authorized domains

**Issue**: "Firestore permission denied"
- **Solution**: Check Firestore rules are in test mode or properly configured

**Issue**: "Messaging not supported"
- **Solution**: Cloud Messaging requires HTTPS or localhost. For production, use Capacitor plugins.

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)




