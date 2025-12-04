<template>
  <div class="date-picker-container">
    <div class="date-picker-header">
      <ion-button fill="clear" @click="previousMonth" class="nav-button">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </ion-button>
      
      <h3 class="month-year">{{ currentMonthYear }}</h3>
      
      <ion-button fill="clear" @click="nextMonth" class="nav-button">
        <ion-icon :icon="chevronForwardOutline"></ion-icon>
      </ion-button>
    </div>

    <div class="day-names">
      <div v-for="day in dayNames" :key="day" class="day-name">{{ day }}</div>
    </div>

    <div class="calendar-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': day.isSelected
        }"
        @click="selectDate(day.date)"
      >
        <span class="day-number">{{ day.day }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

interface Props {
  modelValue: Date;
  minDate?: Date;
}

interface Emits {
  (e: 'update:modelValue', date: Date): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const currentDate = ref(new Date(props.modelValue));
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
  
  // Selected date for comparison
  const selectedDate = new Date(props.modelValue);
  selectedDate.setHours(0, 0, 0, 0);
  
  const days: CalendarDay[] = [];
  
  // Days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    days.push({
      day: prevMonthLastDay - i,
      date,
      isCurrentMonth: false,
      isToday: dateOnly.getTime() === today.getTime(),
      isSelected: dateOnly.getTime() === selectedDate.getTime()
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
      isSelected: dateOnly.getTime() === selectedDate.getTime()
    });
  }
  
  // Days from next month to fill the grid (42 total cells for 6 weeks)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: dateOnly.getTime() === today.getTime(),
      isSelected: dateOnly.getTime() === selectedDate.getTime()
    });
  }
  
  return days;
});

watch(() => props.modelValue, (newDate) => {
  if (newDate) {
    const newDateObj = new Date(newDate);
    // Only update currentDate if the month/year is different
    const newMonth = newDateObj.getMonth();
    const newYear = newDateObj.getFullYear();
    const currentMonth = currentDate.value.getMonth();
    const currentYear = currentDate.value.getFullYear();
    
    if (newMonth !== currentMonth || newYear !== currentYear) {
      currentDate.value = new Date(newYear, newMonth, 1);
    }
  }
}, { immediate: true });

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
  // Check if date is in the past (if minDate is set)
  if (props.minDate) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const minDateOnly = new Date(props.minDate);
    minDateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly < minDateOnly) {
      return; // Don't allow selecting past dates
    }
  }
  
  emit('update:modelValue', date);
  
  // Update current view if selecting a date from different month
  const selectedMonth = date.getMonth();
  const currentMonth = currentDate.value.getMonth();
  if (selectedMonth !== currentMonth) {
    currentDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
  }
}
</script>

<style scoped>
.date-picker-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.month-year {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.nav-button {
  --color: #007AFF;
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  width: 36px;
  height: 36px;
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
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
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

.calendar-day.selected {
  background: #007AFF;
  color: white;
}

.calendar-day.selected .day-number {
  color: white;
  font-weight: 600;
}

.day-number {
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 400;
}

.calendar-day.selected .day-number,
.calendar-day.today .day-number {
  color: white;
}
</style>

