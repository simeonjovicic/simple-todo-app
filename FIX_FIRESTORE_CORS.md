# Fix Firestore CORS Error

## The Problem
You're seeing a CORS error because Firestore security rules are blocking access. This happens when:
1. Security rules expired (test mode expires after 30 days)
2. Rules are too restrictive
3. Rules need to be updated

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `todo-calendar-app-babc9`
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update the Rules
Replace your current rules with these (for development/testing):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read, write: if true;
    }
    match /exams/{examId} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish the Rules
1. Click **Publish** button
2. Wait for confirmation that rules are published

### Step 4: Test
1. Refresh your app
2. The CORS error should be gone
3. You should be able to read/write data

## Alternative: If Rules Have Expired

If you see a message about rules expiring, you need to:

1. **Remove the expiration date** from your rules
2. The rules should look like this (no date check):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Or more specifically:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read, write: if true;
    }
    match /exams/{examId} {
      allow read, write: if true;
    }
  }
}
```

## Important Notes

⚠️ **Security Warning**: These rules allow anyone to read/write your data. This is fine for development, but you should secure them for production.

For production, you would use:
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
  }
}
```

But for now, use the open rules to fix the CORS issue.

## After Fixing

Once you update the rules:
1. Refresh your browser
2. The app should work normally
3. You can add todos and exams without CORS errors

