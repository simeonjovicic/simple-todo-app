<template>
  <div class="todo-item" :class="{ 'completed': todo.completed }">
    <ion-item lines="none" class="todo-item-content">
      <ion-checkbox
        slot="start"
        :checked="todo.completed"
        @ionChange="toggleComplete"
        class="todo-checkbox"
      ></ion-checkbox>
      
      <ion-label class="todo-label">
        <h2>{{ todo.title }}</h2>
        <p v-if="todo.description" class="todo-description">{{ todo.description }}</p>
      </ion-label>
      
      <ion-button
        fill="clear"
        @click="deleteTodo"
        class="delete-button"
        color="medium"
      >
        <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-item>
  </div>
</template>

<script setup lang="ts">
import { IonItem, IonCheckbox, IonLabel, IonButton, IonIcon } from '@ionic/vue';
import { trashOutline } from 'ionicons/icons';
import type { Todo } from '../models/Todo';

interface Props {
  todo: Todo;
}

interface Emits {
  (e: 'toggle', id: string): void;
  (e: 'delete', id: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function toggleComplete(event: CustomEvent) {
  emit('toggle', props.todo.id!);
}

function deleteTodo() {
  emit('delete', props.todo.id!);
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

.delete-button {
  --color: #86868b;
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 40px;
  width: 40px;
}

.delete-button:hover {
  --color: #ff3b30;
}
</style>

