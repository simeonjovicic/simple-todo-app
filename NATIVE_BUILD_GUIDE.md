# Native Build Guide - Android & macOS

## ✅ What's Ready

- ✅ **Android platform** added and synced
- ✅ **iOS/macOS platform** added (needs Xcode for building)
- ✅ **Capacitor configured** with app ID: `com.todocalendar.app`
- ✅ **Web build** ready in `dist/` folder

## 📱 Building for Android

### Prerequisites
1. **Android Studio** - Download from [developer.android.com/studio](https://developer.android.com/studio)
2. **Java Development Kit (JDK)** - Android Studio includes it
3. **Android SDK** - Installed via Android Studio

### Step 1: Open in Android Studio
```bash
cd todo-calendar-app
npx cap open android
```

This will:
- Open Android Studio
- Load the Android project
- Sync Gradle dependencies

### Step 2: Build & Run on Your Phone

**Option A: Connect Your Phone via USB**
1. Enable **Developer Options** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"
2. Connect your phone via USB
3. In Android Studio, click the green "Run" button (▶️)
4. Select your phone from the device list
5. The app will install and launch on your phone!

**Option B: Build APK for Manual Installation**
1. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. Click "locate" in the notification
4. Transfer the APK to your phone
5. On your phone: Settings → Security → Enable "Install from Unknown Sources"
6. Install the APK file

### Step 3: Test the App
- ✅ Todos should sync with Firebase
- ✅ Calendar and exams should work
- ✅ Notifications should work (may need to grant permissions)
- ✅ Dark mode toggle should work

---

## 🍎 Building for macOS

### Prerequisites
1. **Xcode** - Download from Mac App Store (free, but large ~10GB)
2. **Xcode Command Line Tools** (usually installed with Xcode)
3. **CocoaPods** - Install with: `sudo gem install cocoapods`

### Step 1: Install CocoaPods (if not installed)

**Option A: Using Homebrew (Recommended)**
```bash
brew install cocoapods
```

**Option B: Using RubyGems**
```bash
sudo gem install cocoapods
```

### Step 2: Install iOS Dependencies
```bash
cd todo-calendar-app/ios/App
pod install
cd ../..
```

### Step 3: Open in Xcode
```bash
cd todo-calendar-app
npx cap open ios
```

This will:
- Open Xcode
- Load the iOS project
- You can build for iOS or macOS

### Step 4: Build for macOS

**In Xcode:**
1. Click on the project name in the left sidebar
2. Under "TARGETS", select "App"
3. Go to "Signing & Capabilities" tab
4. **IMPORTANT**: Check "Automatically manage signing"
5. Select your **Apple ID** from the "Team" dropdown (or add it if needed)
   - This is FREE - you just need to sign in with your Apple ID
   - This allows the app to run permanently without 7-day limitations
6. At the top, change the device from "iPhone" to "My Mac" or "Any Mac"
7. Click the **Play** button (▶️) or press `Cmd + R`
8. The app will build and launch on your Mac!

**Note**: The first time you sign in with your Apple ID, Xcode will create a free development certificate. This allows the app to run permanently on your Mac without the 7-day limitation.

### Step 5: Create macOS App Bundle (Permanent Installation)

**To create a standalone app that works permanently:**

1. In Xcode: **Product → Archive**
2. Wait for archive to complete
3. In the Organizer window: **Distribute App**
4. Choose **"Development"** (for testing on your Mac)
5. Click **Next** and select your Mac
6. Export the `.app` file to your desired location
7. The app will be properly signed and will work permanently!

**Alternative: Build directly to Applications folder**
1. In Xcode: **Product → Scheme → Edit Scheme**
2. Select "Run" on the left
3. Go to "Options" tab
4. Set "Build Configuration" to "Release"
5. Close the scheme editor
6. Change target to "My Mac"
7. Press `Cmd + B` to build
8. The app will be in: `ios/App/build/Release/App.app`
9. Copy it to `/Applications` or wherever you want
10. The app will work permanently because it's properly signed!

---

## 🔄 Updating the App

Whenever you make changes to your web code:

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync with native platforms:**
   ```bash
   npx cap sync
   ```

3. **Rebuild in Android Studio or Xcode:**
   - Android: Click Run (▶️) again
   - macOS: Click Run (▶️) again

---

## 🐛 Troubleshooting

### Android Issues

**"SDK not found"**
- Open Android Studio
- Go to **Tools → SDK Manager**
- Install Android SDK Platform (API 33 or latest)

**"Gradle sync failed"**
- In Android Studio: **File → Sync Project with Gradle Files**
- Or: **File → Invalidate Caches / Restart**

**App crashes on launch**
- Check Android Studio's Logcat for errors
- Make sure Firebase config is correct
- Check that internet permission is enabled

### macOS/iOS Issues

**"CocoaPods not found"**
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

**"Xcode not found"**
- Install Xcode from Mac App Store
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

**"Code signing error"**
- In Xcode: Project Settings → Signing & Capabilities
- Make sure "Automatically manage signing" is checked
- Select your Apple ID from the Team dropdown
- If you don't see your Apple ID, click "Add Account" and sign in
- **Important**: Using your Apple ID (free) allows permanent installation without 7-day limitations

**"Build failed"**
- Clean build: **Product → Clean Build Folder** (`Cmd + Shift + K`)
- Rebuild: **Product → Build** (`Cmd + B`)

---

## 📝 Important Notes

### Firebase Configuration
- ✅ Your Firebase config is already set up
- ✅ The app will use the same Firebase project on all platforms
- ✅ Data will sync across web, Android, and macOS

### Notifications
- **Android**: Local notifications work out of the box
- **macOS**: Local notifications work out of the box
- **FCM**: Cloud messaging works on all platforms

### Permissions
The app will request:
- **Notifications** - For exam reminders
- **Internet** - For Firebase sync

### macOS Code Signing (Important!)
- **Free Apple ID**: Sign in with your Apple ID in Xcode (free, no paid account needed)
- **Permanent Installation**: Properly signed apps work permanently, no 7-day limitation
- **Development Certificate**: Xcode automatically creates a free development certificate
- **No Gatekeeper Issues**: Properly signed apps bypass macOS security warnings

---

## 🚀 Quick Commands Reference

```bash
# Build web app
npm run build

# Sync with native platforms
npx cap sync

# Open Android Studio
npx cap open android

# Open Xcode
npx cap open ios

# Copy web assets to native projects
npx cap copy

# Update native dependencies
npx cap update
```

---

## ✅ Next Steps

1. **Test on Android** - Connect your phone and run the app
2. **Test on macOS** - Build and run in Xcode
3. **Test all features** - Todos, calendar, notifications
4. **Report any issues** - Let me know if something doesn't work!

---

## 💡 Tips

- **Development**: Use `npm run dev` for web development, then sync when ready
- **Testing**: Test on web first, then build native apps
- **Updates**: Always run `npm run build` and `npx cap sync` after code changes
- **Performance**: Native apps are faster than web - enjoy! 🎉

---

**Ready to build?** Start with Android (easier) or macOS (if you have Xcode installed)!

