# Cloud Functions Setup Guide

## Overview
This guide will help you set up Firebase Cloud Functions to send scheduled FCM notifications for exam reminders.

## Prerequisites
- Node.js installed (v18 or higher)
- Firebase project: `todo-calendar-app-babc9`
- Firebase CLI installed

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

## Step 3: Initialize Functions

```bash
cd todo-calendar-app
firebase init functions
```

**When prompted:**
- Select your project: `todo-calendar-app-babc9`
- Language: **TypeScript**
- ESLint: **Yes**
- Install dependencies: **Yes**

## Step 4: Deploy Functions

```bash
firebase deploy --only functions
```

## Step 5: Set Up Cloud Scheduler (Optional)

The function runs every hour automatically. If you want to change the frequency, you can set up Cloud Scheduler in Firebase Console.

## How It Works

1. **Every hour**, the function checks `examNotificationSchedules` collection
2. Finds notifications that:
   - Are due to be sent (notificationDate <= now)
   - Haven't been sent yet (sent === false)
3. Gets all FCM tokens from `fcmTokens` collection
4. Sends FCM notifications to all devices
5. Marks schedules as `sent: true`

## Testing

After deployment, you can test by:
1. Adding an exam with notifications enabled
2. Setting a notification date in the near future (e.g., 1 minute from now)
3. Waiting for the function to run (or trigger manually)
4. Check your device for the notification

## Manual Trigger (for testing)

You can manually trigger the function in Firebase Console:
1. Go to Functions → `sendScheduledNotifications`
2. Click "Test" tab
3. Click "Test the function"

## Cost

- Cloud Functions: Free tier includes 2 million invocations/month
- Cloud Scheduler: Free tier includes 3 jobs
- FCM: Free for unlimited messages

For a personal app, you'll likely stay within free tier limits.

