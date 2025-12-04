<template>
  <div class="exam-form-container">
    <ion-item lines="none" class="form-item">
      <ion-label position="stacked">Exam Title *</ion-label>
      <ion-input
        v-model="formData.title"
        placeholder="Enter exam title"
        class="form-input"
      ></ion-input>
    </ion-item>

    <ion-item lines="none" class="form-item">
      <ion-label position="stacked">Subject *</ion-label>
      <ion-select
        v-model="formData.subject"
        placeholder="Select subject"
        class="form-input"
        interface="action-sheet"
      >
        <ion-select-option v-for="subject in subjects" :key="subject" :value="subject">
          {{ subject }}
        </ion-select-option>
      </ion-select>
    </ion-item>

    <ion-item lines="none" class="form-item date-item">
      <ion-label position="stacked">Date *</ion-label>
      <DatePicker
        v-model="formData.date"
        :min-date="minDate"
        class="date-picker-wrapper"
      />
    </ion-item>

    <div class="form-actions">
      <ion-button
        fill="outline"
        @click="cancel"
        class="cancel-button"
      >
        Cancel
      </ion-button>
      <ion-button
        @click="save"
        :disabled="!isValid"
        class="save-button"
      >
        Save Exam
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton
} from '@ionic/vue';
import DatePicker from './DatePicker.vue';
import type { ExamFormData } from '../models/Exam';

interface Props {
  initialDate?: Date;
  exam?: { id?: string } & ExamFormData;
}

interface Emits {
  (e: 'save', data: ExamFormData): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const subjects = ['AM', 'POS', 'DBI', 'D', 'BWM', 'E', 'PRE', 'WMC', 'NSCS', 'DSAI'];

const formData = ref<ExamFormData>({
  title: '',
  subject: '',
  date: props.initialDate || new Date(),
  notificationEnabled: true // Enable notifications by default
});

const minDate = computed(() => {
  return new Date();
});

const isValid = computed(() => {
  return formData.value.title.trim().length > 0 && 
         formData.value.subject && 
         formData.value.date;
});

watch(() => props.exam, (newExam) => {
  if (newExam) {
    formData.value = { 
      title: newExam.title,
      subject: newExam.subject || '',
      date: newExam.date,
      notificationEnabled: newExam.notificationEnabled || false
    };
  }
}, { immediate: true });

watch(() => props.initialDate, (newDate) => {
  if (newDate) {
    const newDateOnly = new Date(newDate);
    newDateOnly.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    formData.value.date = newDateOnly;
  }
}, { immediate: true });

function save() {
  if (isValid.value) {
    emit('save', { 
      title: formData.value.title,
      subject: formData.value.subject,
      date: formData.value.date,
      notificationEnabled: formData.value.notificationEnabled || false
    });
  }
}

function cancel() {
  emit('cancel');
}
</script>

<style scoped>
.exam-form-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-item {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  --background: transparent;
  margin-bottom: 20px;
}

.form-item ion-label {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-input {
  margin-top: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 16px;
  width: 100%;
}

.form-input:focus-within {
  border-color: #007AFF;
}

.date-item {
  --padding-start: 0;
  --padding-end: 0;
}

.date-picker-wrapper {
  margin-top: 8px;
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.cancel-button,
.save-button {
  flex: 1;
  --border-radius: 12px;
  height: 44px;
  font-weight: 500;
}

.cancel-button {
  --color: #1d1d1f;
  --border-color: #d2d2d7;
}

.save-button {
  --background: #007AFF;
  --color: white;
}

.save-button[disabled] {
  --background: #c7c7cc;
  opacity: 0.6;
}
</style>
