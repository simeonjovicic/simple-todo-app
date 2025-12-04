<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="settings-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <div class="settings-container">
        <!-- Notification Settings -->
        <div class="settings-section">
          <h3 class="section-title">Notification Settings</h3>
          <p class="section-description">
            Choose how many days before an exam you want to receive notifications.
            You can set multiple reminders.
          </p>

          <div class="notification-days">
            <div
              v-for="(day, index) in localSettings.daysBefore"
              :key="index"
              class="day-input-row"
            >
              <ion-item lines="none" class="day-input-item">
                <ion-label position="stacked">Days before exam</ion-label>
                <ion-input
                  v-model.number="localSettings.daysBefore[index]"
                  type="number"
                  min="0"
                  max="365"
                  placeholder="0"
                  class="day-input"
                ></ion-input>
              </ion-item>
              <ion-button
                v-if="localSettings.daysBefore.length > 1"
                fill="clear"
                @click="removeDay(index)"
                class="remove-button"
                color="danger"
              >
                <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>

            <ion-button
              fill="outline"
              @click="addDay"
              class="add-day-button"
            >
              <ion-icon :icon="addOutline" slot="start"></ion-icon>
              Add Reminder
            </ion-button>
          </div>

          <div class="settings-actions">
            <ion-button
              @click="saveSettings"
              class="save-button"
            >
              Save Settings
            </ion-button>
            <ion-button
              fill="outline"
              @click="resetSettings"
              class="reset-button"
            >
              Reset to Default
            </ion-button>
          </div>

          <div class="resync-notifications">
            <p class="resync-info">
              After changing notification settings, you may want to resync notifications for existing exams.
            </p>
            <ion-button
              fill="outline"
              @click="resyncNotifications"
              class="resync-button"
            >
              Resync All Notifications
            </ion-button>
          </div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <h4>How it works</h4>
          <p>For each exam, you'll receive notifications on the days you specify before the exam date.</p>
          <p class="example">
            Example: If an exam is on December 22nd and you set reminders for 7 and 3 days,
            you'll get notifications on December 15th and December 19th.
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  toastController
} from '@ionic/vue';
import { addOutline, closeOutline } from 'ionicons/icons';
import { useSettings } from '../composables/useSettings';
import { scheduleAllExamNotifications } from '../services/notificationService';
import { getAllExams } from '../services/examService';
import type { Exam } from '../models/Exam';

const { settings, updateSettings, resetSettings: reset } = useSettings();
const localSettings = ref({ daysBefore: [...settings.value.daysBefore] });

onMounted(() => {
  // Initialize local copy
  localSettings.value = { daysBefore: [...settings.value.daysBefore] };
});

function addDay() {
  localSettings.value.daysBefore.push(1);
}

function removeDay(index: number) {
  if (localSettings.value.daysBefore.length > 1) {
    localSettings.value.daysBefore.splice(index, 1);
  }
}

async function saveSettings() {
  // Validate: remove duplicates and sort
  const uniqueDays = [...new Set(localSettings.value.daysBefore)]
    .filter(day => day >= 0 && day <= 365)
    .sort((a, b) => b - a); // Sort descending (furthest first)

  if (uniqueDays.length === 0) {
    const toast = await toastController.create({
      message: 'Please add at least one reminder day',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
    return;
  }

  updateSettings({ daysBefore: uniqueDays });
  localSettings.value = { daysBefore: [...uniqueDays] };

  const toast = await toastController.create({
    message: 'Settings saved successfully',
    duration: 1500,
    position: 'bottom',
    color: 'success'
  });
  await toast.present();
}

async function resetSettings() {
  localSettings.value = { daysBefore: [7, 3] };
  reset();
  
  const toast = await toastController.create({
    message: 'Settings reset to default',
    duration: 1500,
    position: 'bottom',
    color: 'success'
  });
  await toast.present();
}

async function resyncNotifications() {
  try {
    const exams: Exam[] = await getAllExams();
    await scheduleAllExamNotifications(exams);
    
    const toast = await toastController.create({
      message: 'Notifications resynced successfully',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (error: any) {
    console.error('Error resyncing notifications:', error);
    const toast = await toastController.create({
      message: 'Failed to resync notifications',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}

async function handleRefresh(event: CustomEvent) {
  // Refresh settings from localStorage
  localSettings.value = { daysBefore: [...settings.value.daysBefore] };
  (event.target as HTMLIonRefresherElement).complete();
}
</script>

<style scoped>
.settings-content {
  --background: #f5f5f7;
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.notification-days {
  margin-bottom: 24px;
}

.day-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}

.day-input-item {
  flex: 1;
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  --background: transparent;
}

.day-input {
  margin-top: 8px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  font-size: 16px;
}

.day-input:focus-within {
  border-color: #007AFF;
}

.remove-button {
  --color: #ff3b30;
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 56px;
  width: 40px;
  flex-shrink: 0;
}

.add-day-button {
  --border-color: #007AFF;
  --color: #007AFF;
  width: 100%;
  margin-top: 8px;
  --border-radius: 12px;
  height: 44px;
}

.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-button {
  --background: #007AFF;
  --color: white;
  --border-radius: 12px;
  height: 44px;
  font-weight: 500;
}

.reset-button {
  --color: #1d1d1f;
  --border-color: #d2d2d7;
  --border-radius: 12px;
  height: 44px;
  font-weight: 500;
}

.info-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.info-section p {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.example {
  background: #f5f5f7;
  padding: 12px;
  border-radius: 8px;
  font-style: italic;
  margin-top: 8px;
}

.resync-notifications {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e5ea;
}

.resync-info {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.resync-button {
  --color: #007AFF;
  --border-color: #007AFF;
  --border-radius: 12px;
  height: 44px;
  font-weight: 500;
  width: 100%;
}

.dark .resync-notifications {
  border-top-color: #38383a;
}

.dark .example {
  background: #2c2c2e;
}

.dark .settings-content {
  --background: #000000;
}

.dark .settings-section,
.dark .info-section {
  background: #1c1c1e;
}

.dark .section-title,
.dark .info-section h4 {
  color: #ffffff;
}

.dark .section-description,
.dark .info-section p {
  color: #98989d;
}

.dark .example {
  background: #2c2c2e;
}
</style>

