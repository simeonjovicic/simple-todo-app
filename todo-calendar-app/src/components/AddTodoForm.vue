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
        @click="addTodo"
        :disabled="!title.trim()"
        class="add-button"
        color="primary"
      >
        <ion-icon :icon="addOutline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-item>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonItem, IonInput, IonButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';

interface Emits {
  (e: 'add', title: string): void;
}

const emit = defineEmits<Emits>();
const title = ref('');

function addTodo() {
  if (title.value.trim()) {
    emit('add', title.value.trim());
    title.value = '';
  }
}
</script>

<style scoped>
.add-todo-form {
  margin-bottom: 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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

.add-button {
  --color: #007AFF;
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 40px;
  width: 40px;
}

.add-button[disabled] {
  --color: #c7c7cc;
  opacity: 0.5;
}
</style>

