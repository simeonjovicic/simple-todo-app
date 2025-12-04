<template>
  <ion-app>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="tab-bar">
        <ion-tab-button tab="home" href="/home">
          <ion-icon :icon="listOutline"></ion-icon>
          <ion-label>Tasks</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="calendar" href="/calendar">
          <ion-icon :icon="calendarOutline"></ion-icon>
          <ion-label>Calendar</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { listOutline, calendarOutline } from 'ionicons/icons';
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
