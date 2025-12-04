# Todo Calendar App - Implementation Plan

## Project Overview
A minimalistic Ionic Vue todo app with calendar features for exams, notifications, and Firebase backend. Optimized for Mac and Android with minimal resource usage.

## Technology Stack
- **Framework**: Ionic Vue 8
- **Backend**: Firebase (Firestore, Authentication, Cloud Messaging)
- **Platforms**: macOS (Electron/Capacitor) and Android
- **Notifications**: Firebase Cloud Messaging + Capacitor Local Notifications

## Implementation Phases

### Phase 1: Project Setup & Basic Structure ✅ (Already Done)
- [x] Ionic Vue app initialized
- [x] Basic routing setup
- [ ] Install Firebase dependencies
- [ ] Install Capacitor plugins for notifications
- [ ] Configure Firebase project

### Phase 2: Firebase Setup & Configuration
**Goal**: Set up Firebase backend and authentication
- [ ] Create Firebase project
- [ ] Install Firebase SDK
- [ ] Configure Firebase in app
- [ ] Set up Firestore database structure
- [ ] Implement basic authentication (optional for MVP)
- [ ] Test Firebase connection

**Testing**: Verify Firebase connection and data read/write

### Phase 3: Basic Todo Functionality
**Goal**: Core todo CRUD operations
- [ ] Create Todo model/interface
- [ ] Build Todo list view
- [ ] Add Todo form component
- [ ] Implement add todo functionality
- [ ] Implement delete todo functionality
- [ ] Implement toggle complete functionality
- [ ] Connect to Firestore
- [ ] Add loading states

**Testing**: Test adding, deleting, and completing todos

### Phase 4: Calendar Integration
**Goal**: Add calendar view and exam scheduling
- [ ] Install calendar component library (or build custom)
- [ ] Create calendar view
- [ ] Add exam scheduling form
- [ ] Link exams to calendar dates
- [ ] Display exams on calendar
- [ ] Filter todos by date
- [ ] Store exam data in Firestore

**Testing**: Test adding exams and viewing them on calendar

### Phase 5: Notifications Setup
**Goal**: Enable push and local notifications
- [ ] Install Capacitor Local Notifications plugin
- [ ] Install Firebase Cloud Messaging
- [ ] Configure notification permissions
- [ ] Set up notification scheduling for exams
- [ ] Implement notification triggers
- [ ] Test notifications on Mac and Android

**Testing**: Test notifications on both platforms

### Phase 6: UI/UX Polish & Optimization
**Goal**: Minimalistic design and performance
- [ ] Design minimalistic UI theme
- [ ] Optimize bundle size
- [ ] Add smooth animations
- [ ] Implement dark/light mode (optional)
- [ ] Optimize Firestore queries
- [ ] Add offline support (optional)

**Testing**: Performance testing and UI review

### Phase 7: Platform-Specific Builds
**Goal**: Build for Mac and Android
- [ ] Configure Capacitor for macOS
- [ ] Configure Capacitor for Android
- [ ] Build and test on macOS
- [ ] Build and test on Android
- [ ] Handle platform-specific features

**Testing**: Full testing on both platforms

## Firebase Setup Guide

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "todo-calendar-app"
4. Disable Google Analytics (for minimal resource usage)
5. Create project

### Step 2: Enable Services
1. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode (we'll add security rules later)
   - Choose location closest to you

2. **Authentication** (Optional for MVP):
   - Go to Authentication
   - Enable Email/Password sign-in method

3. **Cloud Messaging**:
   - Go to Cloud Messaging
   - Note the Server Key (for notifications)

### Step 3: Register Apps
1. **Web App** (for development):
   - Click Web icon (</>)
   - Register app name
   - Copy Firebase config object

2. **Android App**:
   - Click Android icon
   - Register package name (e.g., `com.yourname.todocalendar`)
   - Download `google-services.json`

3. **macOS App** (if using Electron):
   - Use Web app config

### Step 4: Security Rules (Later)
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

## Database Structure

### Firestore Collections

**todos**
```
{
  id: string (auto-generated)
  title: string
  description?: string
  completed: boolean
  createdAt: timestamp
  dueDate?: timestamp
  userId: string (if using auth)
}
```

**exams**
```
{
  id: string (auto-generated)
  title: string
  subject?: string
  date: timestamp
  time?: string
  location?: string
  notes?: string
  notificationEnabled: boolean
  notificationTime?: timestamp
  userId: string (if using auth)
}
```

## Dependencies to Install

### Firebase
```bash
npm install firebase
```

### Capacitor Plugins
```bash
npm install @capacitor/local-notifications
npm install @capacitor/push-notifications
```

### Calendar (Optional - we can build custom)
```bash
npm install vue-calendar-heatmap  # or custom solution
```

## File Structure (Proposed)
```
src/
├── components/
│   ├── TodoItem.vue
│   ├── TodoForm.vue
│   ├── CalendarView.vue
│   └── ExamForm.vue
├── views/
│   ├── HomePage.vue (Todo list)
│   ├── CalendarPage.vue
│   └── ExamsPage.vue
├── services/
│   ├── firebase.ts
│   ├── todoService.ts
│   ├── examService.ts
│   └── notificationService.ts
├── models/
│   ├── Todo.ts
│   └── Exam.ts
└── router/
    └── index.ts
```

## Next Steps
1. Review and approve this plan
2. Start with Phase 2: Firebase Setup
3. Test each phase before moving to next
4. Iterate on design as we go

