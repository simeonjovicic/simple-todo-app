<template>
  <ion-app>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="tab-bar">
        <ion-tab-button tab="home" href="/home">
          <ion-icon :icon="listOutline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="calendar" href="/calendar">
          <ion-icon :icon="calendarOutline"></ion-icon>
          <ion-label>Calendar</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/settings">
          <ion-icon :icon="settingsOutline"></ion-icon>
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { listOutline, calendarOutline, settingsOutline } from 'ionicons/icons';
import { useDarkMode } from './composables/useDarkMode';
import { initializeNotifications } from './services/notificationService';

// Initialize dark mode
const { isDark } = useDarkMode();

onMounted(() => {
  // Theme is applied in the composable
  // Note: FCM initialization is done on user gesture (button click)
  // to avoid "Notification prompting can only be done from a user gesture" error
});
</script>

<style>
.tab-bar {
  --background: white;
  --border: 1px solid #e5e5ea;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.tab-button {
  --color-selected: #007AFF;
  --color: #86868b;
}
</style>
