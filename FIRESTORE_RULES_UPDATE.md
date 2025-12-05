# Update Firestore Security Rules for FCM

## The Problem
You're getting a "permission-denied" error when trying to store FCM tokens because the Firestore security rules don't allow writes to the new collections.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `todo-calendar-app-babc9`
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update the Rules
Replace your current rules with these (includes the new collections):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Todos collection
    match /todos/{todoId} {
      allow read, write: if true;
    }
    
    // Exams collection
    match /exams/{examId} {
      allow read, write: if true;
    }
    
    // FCM Tokens collection (for Cloud Functions)
    match /fcmTokens/{tokenId} {
      allow read, write: if true;
    }
    
    // Exam Notification Schedules collection (for Cloud Functions)
    match /examNotificationSchedules/{scheduleId} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish the Rules
1. Click **Publish** button
2. Wait for confirmation that rules are published
3. Rules should propagate within 1-2 minutes

### Step 4: Test
1. Refresh your app
2. Click "Test Cloud Notification (FCM)" button
3. The FCM token should now be stored successfully in Firestore

## What These Collections Are For

- **`fcmTokens`**: Stores FCM tokens for each device so Cloud Functions can send push notifications
- **`examNotificationSchedules`**: Stores scheduled notification times for exams so Cloud Functions can send notifications at the right time

## Security Note

⚠️ **For Development**: These rules allow anyone to read/write. This is fine for testing.

**For Production**, you should secure them with authentication:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read, write: if request.auth != null;
    }
    match /exams/{examId} {
      allow read, write: if request.auth != null;
    }
    match /fcmTokens/{tokenId} {
      allow read, write: if request.auth != null;
    }
    match /examNotificationSchedules/{scheduleId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

But for now, use the open rules to get FCM working.




