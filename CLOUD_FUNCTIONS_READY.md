# Cloud Functions Ready! ✅

## What's Been Created

### ✅ Cloud Function Code
- **`functions/src/index.ts`** - Main Cloud Function
  - Runs every hour automatically
  - Checks `examNotificationSchedules` for due notifications
  - Uses your notification settings (daysBefore) from each schedule
  - Sends FCM notifications to all devices
  - Marks schedules as sent

### ✅ Configuration Files
- **`functions/package.json`** - Dependencies
- **`functions/tsconfig.json`** - TypeScript config
- **`firebase.json`** - Firebase project config
- **`.firebaserc`** - Project ID configuration
- **`firestore.rules`** - Updated security rules
- **`firestore.indexes.json`** - Database indexes for queries

## How It Works

1. **Your Settings Are Used**: Each notification schedule stores the `daysBefore` value from your settings when created
2. **Automatic Scheduling**: Function runs every hour via Cloud Scheduler
3. **Smart Notifications**: 
   - Finds notifications due to be sent (notificationDate <= now)
   - Gets all FCM tokens from `fcmTokens` collection
   - Sends notifications to all your devices
   - Marks as sent to avoid duplicates

## Next Steps: Deploy

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Install Function Dependencies
```bash
cd todo-calendar-app/functions
npm install
```

### 4. Build Functions
```bash
npm run build
```

### 5. Deploy Functions
```bash
cd ..
firebase deploy --only functions
```

### 6. Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Testing

After deployment:

1. **Add an exam** with notifications enabled
2. **Set notification time** in the near future (e.g., 5 minutes from now)
3. **Wait for the function** to run (or trigger manually)
4. **Check your device** for the notification

### Manual Trigger (for testing)

You can manually trigger the function:
- Go to Firebase Console → Functions
- Click on `sendScheduledNotificationsManual`
- Click "Test" tab → "Test the function"

Or call the HTTP endpoint directly (URL will be shown after deployment).

## How Your Settings Work

Your notification settings (e.g., 7 days and 3 days before) are:
1. **Stored in localStorage** (for the app)
2. **Used when creating schedules** - each schedule document stores the `daysBefore` value
3. **Used by Cloud Function** - reads `daysBefore` from each schedule document

So when you change settings and resync notifications, new schedules are created with the new `daysBefore` values, and the Cloud Function will use those values.

## Cost

- **Cloud Functions**: Free tier = 2M invocations/month
- **Cloud Scheduler**: Free tier = 3 jobs
- **FCM**: Free for unlimited messages

For personal use, you'll stay well within free limits.

## Troubleshooting

### Function not running?
- Check Firebase Console → Functions → Logs
- Verify Cloud Scheduler is enabled
- Check that schedules exist in Firestore

### Notifications not received?
- Verify FCM tokens exist in `fcmTokens` collection
- Check notification permission is granted
- Verify service worker is registered (for web)

### Need to change schedule frequency?
- Edit `functions/src/index.ts`
- Change `every 1 hours` to your preferred interval
- Redeploy: `firebase deploy --only functions`

## Ready to Deploy!

Follow the steps above to deploy. Once deployed, your scheduled notifications will work even when the app/browser is closed! 🎉

