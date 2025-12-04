<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Todo Calendar App</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Todo Calendar App</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <div v-if="loading" class="loading">
          <ion-spinner></ion-spinner>
          <p>Testing Firebase connection...</p>
        </div>
        
        <div v-else-if="connectionStatus === 'success'" class="success">
          <ion-icon :icon="checkmarkCircle" size="large" color="success"></ion-icon>
          <strong>Firebase Connected! ✅</strong>
          <p>Your Firebase connection is working correctly.</p>
          <p class="info">Todos: {{ todosCount }} | Exams: {{ examsCount }}</p>
        </div>
        
        <div v-else-if="connectionStatus === 'error'" class="error">
          <ion-icon :icon="closeCircle" size="large" color="danger"></ion-icon>
          <strong>Connection Error</strong>
          <p>{{ errorMessage }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSpinner, IonIcon } from '@ionic/vue';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { getAllTodos } from '../services/todoService';
import { getAllExams } from '../services/examService';

const loading = ref(true);
const connectionStatus = ref<'idle' | 'success' | 'error'>('idle');
const errorMessage = ref('');
const todosCount = ref(0);
const examsCount = ref(0);

async function testFirebaseConnection() {
  try {
    loading.value = true;
    connectionStatus.value = 'idle';
    
    // Test reading from Firestore
    const todos = await getAllTodos();
    const exams = await getAllExams();
    
    todosCount.value = todos.length;
    examsCount.value = exams.length;
    
    connectionStatus.value = 'success';
    console.log('Firebase connection successful!');
    console.log(`Found ${todos.length} todos and ${exams.length} exams`);
  } catch (error: any) {
    connectionStatus.value = 'error';
    errorMessage.value = error.message || 'Failed to connect to Firebase';
    console.error('Firebase connection error:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  testFirebaseConnection();
});
</script>

<style scoped>
#container {
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.loading, .success, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading ion-spinner {
  margin-bottom: 16px;
}

.success ion-icon, .error ion-icon {
  margin-bottom: 8px;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
  margin-top: 8px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 4px 0;
}

.info {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}
</style>
