<template>
  <div class="add-todo-form">
    <ion-item lines="none" class="input-container">
      <ion-input
        v-model="title"
        placeholder="New todo..."
        @keyup.enter="addTodo"
        class="todo-input"
        :clear-on-edit="false"
      ></ion-input>
      <ion-button
        fill="clear"
        @click="toggleDueDate"
        class="date-button"
        :color="showDueDate ? 'primary' : 'medium'"
        title="Add due date"
      >
        <ion-icon :icon="calendarOutline" slot="icon-only"></ion-icon>
      </ion-button>
      <ion-button
        fill="clear"
        @click="addTodo"
        :disabled="!title.trim()"
        class="add-button"
        color="primary"
      >
        <ion-icon :icon="addOutline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-item>
    
    <div v-if="showDueDate" class="due-date-picker">
      <DatePicker
        v-model="dueDate"
        :min-date="minDate"
        class="date-picker-wrapper"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonItem, IonInput, IonButton, IonIcon } from '@ionic/vue';
import { addOutline, calendarOutline } from 'ionicons/icons';
import DatePicker from './DatePicker.vue';

interface Emits {
  (e: 'add', data: { title: string; dueDate?: Date }): void;
}

const emit = defineEmits<Emits>();
const title = ref('');
const showDueDate = ref(false);
const dueDate = ref<Date>(new Date());

const minDate = computed(() => {
  return new Date();
});

function toggleDueDate() {
  showDueDate.value = !showDueDate.value;
  if (showDueDate.value && !dueDate.value) {
    dueDate.value = new Date();
  }
}

function addTodo() {
  if (title.value.trim()) {
    emit('add', {
      title: title.value.trim(),
      dueDate: showDueDate.value ? dueDate.value : undefined
    });
    title.value = '';
    showDueDate.value = false;
    dueDate.value = new Date();
  }
}
</script>

<style scoped>
.add-todo-form {
  margin-bottom: 20px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.add-todo-form:focus-within {
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.15);
  border-color: rgba(0, 122, 255, 0.2);
  transform: translateY(-1px);
}

.input-container {
  --padding-start: 16px;
  --padding-end: 8px;
  --inner-padding-end: 0;
  --min-height: 56px;
  --background: transparent;
}

.todo-input {
  flex: 1;
  font-size: 16px;
  --padding-start: 0;
  --padding-end: 0;
  --color: #1d1d1f;
}

.todo-input::part(native) {
  padding: 0;
}

.date-button,
.add-button {
  --color: #007AFF;
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 40px;
  width: 40px;
}

.date-button {
  --color: #86868b;
}

.date-button[color="primary"] {
  --color: #007AFF;
}

.add-button[disabled] {
  --color: #c7c7cc;
  opacity: 0.5;
}

.due-date-picker {
  padding: 12px 16px 16px;
  border-top: 1px solid #e5e5ea;
  margin-top: 8px;
}

.date-picker-wrapper {
  width: 100%;
}
</style>
