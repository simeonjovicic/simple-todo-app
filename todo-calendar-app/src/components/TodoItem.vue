<template>
  <div class="todo-item" :class="{ 'completed': todo.completed }">
    <ion-item lines="none" class="todo-item-content">
      <ion-checkbox
        slot="start"
        :checked="todo.completed"
        @ionChange="toggleComplete"
        class="todo-checkbox"
      ></ion-checkbox>
      
      <ion-label class="todo-label" @click="startEdit" v-if="!isEditing">
        <h2>{{ todo.title }}</h2>
        <p v-if="todo.description" class="todo-description">{{ todo.description }}</p>
        <p v-if="todo.dueDate" class="todo-due-date">
          <ion-icon :icon="calendarOutline"></ion-icon>
          {{ formatDueDate(todo.dueDate) }}
        </p>
      </ion-label>

      <div v-else class="edit-form">
        <ion-input
          v-model="editTitle"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          class="edit-input"
          placeholder="Todo title"
        ></ion-input>
      </div>
      
      <div class="action-buttons">
        <ion-button
          v-if="!isEditing"
          fill="clear"
          @click="startEdit"
          class="edit-button"
          color="medium"
        >
          <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button
          v-if="isEditing"
          fill="clear"
          @click="saveEdit"
          class="save-button"
          color="success"
        >
          <ion-icon :icon="checkmarkOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button
          v-if="isEditing"
          fill="clear"
          @click="cancelEdit"
          class="cancel-button"
          color="medium"
        >
          <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button
          fill="clear"
          @click="deleteTodo"
          class="delete-button"
          color="medium"
        >
          <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
    </ion-item>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonItem, IonCheckbox, IonLabel, IonButton, IonIcon, IonInput } from '@ionic/vue';
import { trashOutline, createOutline, checkmarkOutline, closeOutline, calendarOutline } from 'ionicons/icons';
import type { Todo } from '../models/Todo';

interface Props {
  todo: Todo;
}

interface Emits {
  (e: 'toggle', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'edit', id: string, title: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEditing = ref(false);
const editTitle = ref('');

function toggleComplete(event: CustomEvent) {
  emit('toggle', props.todo.id!);
}

function deleteTodo() {
  emit('delete', props.todo.id!);
}

function startEdit() {
  isEditing.value = true;
  editTitle.value = props.todo.title;
  // Focus input after a brief delay
  setTimeout(() => {
    const input = document.querySelector('.edit-input input');
    if (input) {
      (input as HTMLInputElement).focus();
      (input as HTMLInputElement).select();
    }
  }, 50);
}

function saveEdit() {
  if (editTitle.value.trim()) {
    emit('edit', props.todo.id!, editTitle.value.trim());
    isEditing.value = false;
  }
}

function cancelEdit() {
  isEditing.value = false;
  editTitle.value = props.todo.title;
}

function formatDueDate(dueDate: Date | any): string {
  const date = dueDate instanceof Date 
    ? dueDate 
    : dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateOnly = new Date(date);
  dueDateOnly.setHours(0, 0, 0, 0);
  
  const diffTime = dueDateOnly.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
  } else {
    return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
}
</script>

<style scoped>
.todo-item {
  margin-bottom: 8px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.todo-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item-content {
  --padding-start: 16px;
  --padding-end: 8px;
  --inner-padding-end: 0;
  --min-height: 64px;
  --background: transparent;
}

.todo-checkbox {
  margin-right: 12px;
  --size: 24px;
  --checkbox-background-checked: #007AFF;
  --border-color-checked: #007AFF;
}

.todo-label {
  flex: 1;
  margin: 0;
  cursor: pointer;
}

.todo-label h2 {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.todo-item.completed .todo-label h2 {
  text-decoration: line-through;
  color: #86868b;
}

.todo-description {
  font-size: 14px;
  color: #86868b;
  margin: 0;
  line-height: 1.4;
}

.todo-due-date {
  font-size: 12px;
  color: #007AFF;
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.todo-due-date ion-icon {
  font-size: 14px;
}

.edit-form {
  flex: 1;
  margin-right: 8px;
}

.edit-input {
  --padding-start: 0;
  --padding-end: 0;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
}

.edit-button,
.save-button,
.cancel-button,
.delete-button {
  --color: #86868b;
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 40px;
  width: 40px;
}

.save-button {
  --color: #34c759;
}

.edit-button:hover {
  --color: #007AFF;
}

.delete-button:hover {
  --color: #ff3b30;
}
</style>
