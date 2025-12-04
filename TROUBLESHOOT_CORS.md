# Troubleshooting Firestore CORS Error

## Steps to Fix

### 1. Verify Rules Are Published
1. Go to Firebase Console → Firestore Database → Rules
2. Make sure you see the rules you just published
3. Check that there's no error message
4. Rules should look exactly like this:

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

### 2. Clear Browser Cache
1. **Chrome/Edge**: 
   - Press `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
   - Select "Cached images and files"
   - Click "Clear data"
   - Or try Hard Refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

2. **Safari**:
   - Press `Cmd+Option+E` to clear cache
   - Or go to Safari → Preferences → Advanced → Show Develop menu
   - Then Develop → Empty Caches

### 3. Wait for Rules to Propagate
- Rules can take 1-2 minutes to propagate globally
- Wait 2-3 minutes after publishing, then refresh

### 4. Check Browser Console for More Details
Open browser DevTools (F12) and check:
- **Console tab**: Look for more specific error messages
- **Network tab**: Check if Firestore requests are being blocked
- Look for any red errors that give more context

### 5. Try Incognito/Private Mode
1. Open browser in Incognito/Private mode
2. Go to your app
3. This bypasses cache and extensions

### 6. Check Firebase Project Settings
1. Go to Firebase Console → Project Settings
2. Make sure your web app is registered
3. Check that the API key is correct

### 7. Verify Your Firebase Config
Make sure your `.env` file has the correct values:
- Check that `VITE_FIREBASE_PROJECT_ID` matches: `todo-calendar-app-babc9`
- All other config values should match your Firebase project

### 8. Alternative: Try Simpler Rules
If still not working, try the most permissive rules:

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

This allows everything - use only for testing!

### 9. Check Network Tab
1. Open DevTools → Network tab
2. Filter by "firestore"
3. Look for failed requests
4. Check the response - it might give more details

### 10. Restart Dev Server
Sometimes the dev server needs a restart:
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd todo-calendar-app
npm run dev
```

## Common Causes

1. **Rules not propagated yet** - Wait 2-3 minutes
2. **Browser cache** - Clear cache or use incognito
3. **Wrong project ID** - Check your .env file
4. **Rules syntax error** - Make sure rules are valid
5. **Browser extensions** - Try disabling ad blockers

## Still Not Working?

If none of these work, the issue might be:
- Browser security settings
- Network/firewall blocking
- Firebase project configuration issue

Try:
1. Different browser (Chrome, Firefox, Safari)
2. Different network (mobile hotspot)
3. Check if other Firebase features work

