# Making Your App Permanent on macOS 🍎

## ✅ Yes, You Can Run It Anytime!

After building in Xcode, your app is installed and **can run independently** - you don't need Xcode open!

When you build and run (`Cmd + R`), Xcode installs the app to:
```
~/Library/Developer/Xcode/DerivedData/App-*/Build/Products/Debug-maccatalyst/App.app
```

This is why you can find it in Spotlight! ✅

---

## 🎯 Make It Permanent (Recommended)

To make it easier to access and keep it permanently, **copy it to Applications**:

### Option 1: Using Finder (Easiest)

1. **In Xcode:** `Product → Show Build Folder in Finder`
2. Navigate to: `App → Build → Products → Debug-maccatalyst → App.app`
3. **Drag `App.app` to your Applications folder** (or any folder you want)
4. Done! 🎉

Now you can:
- ✅ Find it in Spotlight anytime
- ✅ Launch it from Applications
- ✅ Add it to Dock
- ✅ It works even after restarting your Mac

### Option 2: Using Terminal

```bash
# Find the app
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -name "App.app" -type d -path "*/Debug-maccatalyst/*" | head -1)

# Copy to Applications
cp -R "$APP_PATH" /Applications/

# Now you can launch it from Applications!
open /Applications/App.app
```

---

## 🔄 After Code Changes

When you update your code:

1. **Build in Xcode:** `Cmd + R` (or `Cmd + B` to just build)
2. **Copy the new app** to Applications again (replace the old one)
3. Done! Your app is updated

**Tip:** You can create a script to automate this:

```bash
#!/bin/bash
# Quick update script
cd /Users/simeon/Documents/Projects/simple-todo-app/todo-calendar-app
npm run build
npx cap sync ios
# Then build in Xcode and copy the app
```

---

## 📍 Where Is My App?

**Current location (temporary):**
```
~/Library/Developer/Xcode/DerivedData/App-*/Build/Products/Debug-maccatalyst/App.app
```

**Recommended location (permanent):**
```
/Applications/App.app
```

Or anywhere you prefer:
- `~/Desktop/App.app`
- `~/Documents/Apps/App.app`
- Any folder you want!

---

## ✅ Summary

- ✅ **App works without Xcode** - Once built, it's independent
- ✅ **Findable in Spotlight** - Because it's installed
- ✅ **Make it permanent** - Copy to Applications folder
- ✅ **Works after restart** - As long as it's properly signed
- ✅ **Update anytime** - Just rebuild and copy again

**Your app is ready to use anytime!** 🚀


