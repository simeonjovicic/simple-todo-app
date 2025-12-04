<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Calendar</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddExam = true">
            <ion-icon :icon="addOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="calendar-content">
      <div class="calendar-page-container">
        <!-- Calendar View (Collapsible) -->
        <div class="calendar-section">
          <div class="calendar-header-toggle" @click="toggleCalendar">
            <h3 class="section-title">Calendar</h3>
            <ion-icon 
              :icon="calendarExpanded ? chevronUpOutline : chevronDownOutline" 
              class="toggle-icon"
            ></ion-icon>
          </div>
          <div v-show="calendarExpanded" class="calendar-wrapper">
            <CalendarView
              :exams="exams"
              :selected-date="selectedDate || undefined"
              @date-selected="handleDateSelected"
            />
          </div>
        </div>

        <!-- Upcoming Exams List -->
        <div v-if="upcomingExams.length > 0" class="exams-section">
          <h3 class="section-title">Upcoming Exams</h3>
          <div class="exams-list">
            <div
              v-for="exam in upcomingExams"
              :key="exam.id"
              class="exam-card"
            >
              <div class="exam-header">
                <div class="exam-main" @click="editExam(exam)">
                  <h4>{{ exam.title }}</h4>
                  <div class="exam-meta">
                    <span class="exam-subject">{{ exam.subject }}</span>
                    <span class="exam-date">{{ formatExamDate(exam.date) }}</span>
                  </div>
                </div>
                <div class="exam-actions">
                  <ion-button
                    fill="clear"
                    @click="editExam(exam)"
                    class="edit-button"
                    color="medium"
                  >
                    <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
                  </ion-button>
                  <ion-button
                    fill="clear"
                    @click="deleteExam(exam.id!)"
                    class="delete-button"
                    color="medium"
                  >
                    <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && !error" class="empty-exams">
          <ion-icon :icon="calendarOutline" size="large" color="medium"></ion-icon>
          <h3>No upcoming exams</h3>
          <p>Add an exam to get started</p>
          <ion-button fill="outline" @click="showAddExam = true">
            Add Exam
          </ion-button>
        </div>

        <!-- Test Notification Button -->
        <div class="test-notification-section">
          <ion-button 
            fill="outline" 
            @click="testNotification"
            class="test-notification-button"
          >
            <ion-icon :icon="notificationsOutline" slot="start"></ion-icon>
            Test Notification
          </ion-button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-spinner></ion-spinner>
          <p>Loading calendar...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-state">
          <ion-icon :icon="alertCircleOutline" size="large" color="medium"></ion-icon>
          <p>{{ error }}</p>
          <ion-button fill="outline" @click="loadExams">Try Again</ion-button>
        </div>
      </div>

      <!-- Add/Edit Exam Modal -->
      <ion-modal :is-open="showAddExam" @didDismiss="closeExamForm">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingExam ? 'Edit Exam' : 'Add Exam' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeExamForm">
                <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="modal-content">
            <ExamForm
              :initial-date="selectedDate || new Date()"
              :exam="editingExam"
              @save="handleSaveExam"
              @cancel="closeExamForm"
            />
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonModal
} from '@ionic/vue';
import {
  addOutline,
  trashOutline,
  alertCircleOutline,
  closeOutline,
  calendarOutline,
  chevronUpOutline,
  chevronDownOutline,
  notificationsOutline,
  createOutline
} from 'ionicons/icons';
import CalendarView from '../components/CalendarView.vue';
import ExamForm from '../components/ExamForm.vue';
import { getAllExams, addExam, updateExam, deleteExam as deleteExamService } from '../services/examService';
import { 
  requestNotificationPermission, 
  scheduleExamNotification, 
  cancelExamNotification,
  scheduleAllExamNotifications,
  sendTestNotification
} from '../services/notificationService';
import type { Exam, ExamFormData } from '../models/Exam';
import { toastController } from '@ionic/vue';

const exams = ref<Exam[]>([]);
const loading = ref(true);
const error = ref('');
const selectedDate = ref<Date | null>(null);
const showAddExam = ref(false);
const editingExam = ref<{ id?: string } & ExamFormData | undefined>(undefined);
const calendarExpanded = ref(true);

const upcomingExams = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return exams.value
    .filter(exam => {
      const examDate = exam.date instanceof Date 
        ? exam.date 
        : exam.date.toDate ? exam.date.toDate() : new Date(exam.date);
      const examDateOnly = new Date(examDate);
      examDateOnly.setHours(0, 0, 0, 0);
      return examDateOnly >= today;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Date 
        ? a.date 
        : a.date.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date instanceof Date 
        ? b.date 
        : b.date.toDate ? b.date.toDate() : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
});

function formatExamDate(date: Date | any): string {
  const examDate = date instanceof Date 
    ? date 
    : date.toDate ? date.toDate() : new Date(date);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDateOnly = new Date(examDate);
  examDateOnly.setHours(0, 0, 0, 0);
  
  const diffTime = examDateOnly.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays < 7) {
    return examDate.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return examDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: examDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
}

async function loadExams() {
  try {
    loading.value = true;
    error.value = '';
    exams.value = await getAllExams();
  } catch (err: any) {
    error.value = err.message || 'Failed to load exams';
    console.error('Error loading exams:', err);
  } finally {
    loading.value = false;
  }
}

async function requestPermissions() {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn('Notification permission not granted');
    }
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
  }
}

function handleDateSelected(date: Date) {
  selectedDate.value = date;
  // Open the form with the selected date
  showAddExam.value = true;
}

async function handleSaveExam(examData: ExamFormData) {
  try {
    if (editingExam.value && editingExam.value.id) {
      // Update existing exam
      await updateExam(editingExam.value.id, examData);
      await loadExams();
      
      const toast = await toastController.create({
        message: 'Exam updated successfully',
        duration: 1500,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } else {
      // Add new exam
      const examId = await addExam(examData);
      await loadExams();
      
      // Schedule notification if enabled
      if (examData.notificationEnabled) {
        // Get the newly created exam from the loaded list
        const newExam = exams.value.find(e => e.id === examId);
        if (newExam) {
          try {
            await scheduleExamNotification(newExam);
          } catch (notifError) {
            console.error('Error scheduling notification:', notifError);
            // Don't fail the whole operation if notification fails
          }
        }
      }
      
      const toast = await toastController.create({
        message: 'Exam added successfully',
        duration: 1500,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    }
    
    closeExamForm();
  } catch (err: any) {
    console.error('Error saving exam:', err);
    const toast = await toastController.create({
      message: 'Failed to save exam',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}

function editExam(exam: Exam) {
  editingExam.value = {
    id: exam.id,
    title: exam.title,
    subject: exam.subject || '',
    date: exam.date instanceof Date 
      ? exam.date 
      : exam.date.toDate ? exam.date.toDate() : new Date(exam.date),
    notificationEnabled: exam.notificationEnabled || false
  };
  selectedDate.value = editingExam.value.date;
  showAddExam.value = true;
}

async function deleteExam(id: string) {
  try {
    // Cancel notification before deleting
    try {
      await cancelExamNotification(id);
    } catch (notifError) {
      console.error('Error cancelling notification:', notifError);
      // Continue with deletion even if notification cancellation fails
    }
    
    await deleteExamService(id);
    await loadExams();
    
    const toast = await toastController.create({
      message: 'Exam deleted',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (err: any) {
    console.error('Error deleting exam:', err);
    const toast = await toastController.create({
      message: 'Failed to delete exam',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}

function closeExamForm() {
  showAddExam.value = false;
  editingExam.value = undefined;
}

function toggleCalendar() {
  calendarExpanded.value = !calendarExpanded.value;
}

onMounted(async () => {
  await requestPermissions();
  await loadExams();
  // Schedule notifications for all existing exams
  await syncNotifications();
});

async function syncNotifications() {
  try {
    // Schedule notifications for all exams that have notifications enabled
    await scheduleAllExamNotifications(exams.value);
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

async function testNotification() {
  try {
    await sendTestNotification();
    const toast = await toastController.create({
      message: 'Test notification sent! Check your notifications in 2 seconds.',
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (error: any) {
    console.error('Error testing notification:', error);
    const toast = await toastController.create({
      message: error.message || 'Failed to send test notification. Check console for details.',
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}
</script>

<style scoped>
.calendar-content {
  --background: #f5f5f7;
}

.calendar-page-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.calendar-section {
  margin-bottom: 24px;
}

.calendar-header-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.calendar-header-toggle:hover {
  background: #f9f9f9;
}

.calendar-header-toggle .section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.toggle-icon {
  font-size: 20px;
  color: #007AFF;
  transition: transform 0.2s ease;
}

.calendar-wrapper {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.exams-section {
  margin-top: 24px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
}

.exams-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exam-card {
  padding: 16px;
  background: #f5f5f7;
  border-radius: 12px;
  border-left: 3px solid #007AFF;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.exam-main {
  flex: 1;
  cursor: pointer;
}

.exam-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.edit-button {
  --color: #86868b;
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
}

.edit-button:hover {
  --color: #007AFF;
}

.exam-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.exam-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.exam-subject {
  background: #007AFF;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
}

.exam-date {
  color: #86868b;
  font-size: 14px;
}

.delete-button {
  --color: #86868b;
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
}

.delete-button:hover {
  --color: #ff3b30;
}

.empty-exams {
  margin-top: 24px;
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-exams ion-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-exams h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.empty-exams p {
  color: #86868b;
  margin-bottom: 20px;
  font-size: 16px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state ion-spinner {
  margin-bottom: 16px;
}

.loading-state p,
.error-state p {
  color: #86868b;
  font-size: 16px;
  margin-top: 12px;
}

.error-state ion-icon {
  margin-bottom: 8px;
  opacity: 0.6;
}

.modal-content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.test-notification-section {
  margin-top: 24px;
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.test-notification-button {
  --border-color: #007AFF;
  --color: #007AFF;
  --border-radius: 12px;
  height: 44px;
  font-weight: 500;
}
</style>

