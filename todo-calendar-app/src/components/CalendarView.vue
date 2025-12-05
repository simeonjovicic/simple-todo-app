<template>
  <div class="calendar-container">
    <!-- Month Navigation -->
    <div class="calendar-header">
      <ion-button fill="clear" @click="previousMonth" class="nav-button">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </ion-button>
      
      <h2 class="month-title">{{ currentMonthYear }}</h2>
      
      <ion-button fill="clear" @click="nextMonth" class="nav-button">
        <ion-icon :icon="chevronForwardOutline"></ion-icon>
      </ion-button>
    </div>

    <!-- Day Names -->
    <div class="day-names">
      <div v-for="day in dayNames" :key="day" class="day-name">{{ day }}</div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'has-exam': day.hasExam
        }"
        @click="selectDate(day.date)"
      >
        <span class="day-number">{{ day.day }}</span>
        <div v-if="day.hasExam" class="exam-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import type { Exam } from '../models/Exam';

interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasExam: boolean;
}

interface Props {
  exams: Exam[];
  selectedDate?: Date;
}

interface Emits {
  (e: 'dateSelected', date: Date): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const currentDate = ref(new Date());
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const days: CalendarDay[] = [];
  
  // Days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      day: prevMonthLastDay - i,
      date,
      isCurrentMonth: false,
      isToday: false,
      hasExam: hasExamOnDate(date)
    });
  }
  
  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    days.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: dateOnly.getTime() === today.getTime(),
      hasExam: hasExamOnDate(date)
    });
  }
  
  // Days from next month to fill the grid (42 total cells for 6 weeks)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      hasExam: hasExamOnDate(date)
    });
  }
  
  return days;
});

function hasExamOnDate(date: Date): boolean {
  if (!props.exams || props.exams.length === 0) return false;
  
  const dateStr = date.toDateString();
  return props.exams.some(exam => {
    const examDate = exam.date instanceof Date 
      ? exam.date 
      : exam.date.toDate ? exam.date.toDate() : new Date(exam.date);
    return examDate.toDateString() === dateStr;
  });
}

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
}

function selectDate(date: Date) {
  emit('dateSelected', date);
}
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.month-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.nav-button {
  --color: #007AFF;
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  width: 40px;
  height: 40px;
}

.day-names {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.day-name {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #86868b;
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.calendar-day:hover {
  background: #f5f5f7;
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: #007AFF;
  color: white;
}

.calendar-day.today .day-number {
  color: white;
  font-weight: 600;
}

.day-number {
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 400;
}

.exam-indicator {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #007AFF;
}

.calendar-day.today .exam-indicator {
  background: white;
}

.calendar-day.has-exam:not(.today) {
  background: #f0f7ff;
}
</style>




