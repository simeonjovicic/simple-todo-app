# Easiest macOS Build Guide 🍎

## The Simplest Approach (Recommended)

This is the **easiest and fastest** way to get your app running on macOS permanently.

---

## Step 1: Install CocoaPods (One-Time Setup)

```bash
brew install cocoapods
```

That's it! Homebrew handles everything.

---

## Step 2: Install iOS Dependencies

```bash
cd todo-calendar-app/ios/App
pod install
cd ../..
```

Wait for it to finish (takes 1-2 minutes the first time).

---

## Step 3: Open in Xcode

```bash
cd todo-calendar-app
npx cap open ios
```

Xcode will open automatically.

---

## Step 4: Configure Signing (One-Time Setup)

**In Xcode:**

1. Click on **"App"** in the left sidebar (under PROJECTS)
2. Select the **"App"** target (under TARGETS)
3. Click the **"Signing & Capabilities"** tab
4. ✅ Check **"Automatically manage signing"**
5. Click the **"Team"** dropdown
   - If you see your Apple ID, select it
   - If not, click **"Add Account..."**
   - Sign in with your Apple ID (free, no paid account needed)
   - Select your Apple ID from the dropdown
6. Xcode will automatically create a free development certificate ✅

**That's it!** This is a one-time setup. Future builds will use this automatically.

---

## Step 5: Build for macOS

**In Xcode:**

1. At the top toolbar, click the device selector (next to the Play button)
2. Change from **"iPhone"** to **"My Mac"** or **"Any Mac"**
3. Click the **Play button (▶️)** or press `Cmd + R`
4. Wait for the build to complete (first time takes 2-3 minutes)
5. The app will launch automatically! 🎉

---

## Step 6: Create Standalone App (Optional)

If you want a standalone `.app` file you can move anywhere:

1. In Xcode: **Product → Build** (or `Cmd + B`)
2. The app will be built to: `ios/App/build/Release/App.app`
3. You can copy this `.app` file anywhere and it will work!

**To find the app:**
- In Xcode: **Product → Show Build Folder in Finder**
- Navigate to: `App → Build → Products → Release → App.app`
- Drag it to Applications or wherever you want!

---

## Why This is the Easiest Approach

✅ **Uses Capacitor iOS platform** - Already set up, no extra configuration  
✅ **One-time signing setup** - Just sign in with Apple ID (free)  
✅ **Xcode handles everything** - No manual certificate management  
✅ **Permanent installation** - Properly signed, no 7-day limitation  
✅ **Native performance** - Full macOS app, not a web wrapper  
✅ **All features work** - Notifications, Firebase, everything  

---

## Alternative: Even Simpler (Web App)

If you just want to test quickly without building:

```bash
cd todo-calendar-app
npm run dev
```

Then open `http://localhost:5173` in your browser. But this won't be a native app.

---

## Troubleshooting

### "CocoaPods not found"
```bash
brew install cocoapods
```

### "Xcode not found"
- Install Xcode from Mac App Store (free, but large ~10GB)
- Or use the web version for now

### "Signing error"
- Make sure "Automatically manage signing" is checked
- Make sure you've selected your Apple ID in the Team dropdown
- Xcode will create the certificate automatically

### "Build failed"
- Clean build: **Product → Clean Build Folder** (`Cmd + Shift + K`)
- Try building again: **Product → Build** (`Cmd + B`)

---

## Summary: The Easiest Path

1. `brew install cocoapods` (one-time)
2. `cd ios/App && pod install` (one-time)
3. `npx cap open ios` (opens Xcode)
4. Sign in with Apple ID in Xcode (one-time)
5. Select "My Mac" and click Play ▶️
6. Done! 🎉

**Total time:** ~5-10 minutes (mostly waiting for downloads/builds)

---

## Next Steps After Building

- ✅ Test all features (todos, calendar, notifications)
- ✅ The app will be in your Applications or wherever you saved it
- ✅ It will work permanently (no 7-day limitation)
- ✅ You can update it anytime by rebuilding in Xcode

**That's it!** This is the simplest and best approach for macOS. 🚀




