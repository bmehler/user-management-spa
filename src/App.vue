<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useUserStore } from './stores/useUserStore';

const store = useUserStore();

// Create form
const name = ref('');
const email = ref('');

// Edit mode
const editingId = ref<string | null>(null);
const editName = ref('');
const editEmail = ref('');

// Load users on mount
onMounted(async () => {
  await store.fetchUsers();
});

// Debug watcher
watch(() => store.users.value, (val) => {
  console.log("USERS CHANGED:", val);
});

// Create user
const onSubmit = async () => {
  if (!name.value || !email.value) return;
  await store.createUser(name.value, email.value);
  name.value = '';
  email.value = '';
};

// Delete user
const onDelete = async (id: string) => {
  await store.deleteUser(id);
};

// Start editing
const startEdit = (user: any) => {
  editingId.value = user.id;
  editName.value = user.name;
  editEmail.value = user.email;
};

// Cancel editing
const cancelEdit = () => {
  editingId.value = null;
  editName.value = '';
  editEmail.value = '';
};

// Save update
const onUpdate = async () => {
  if (!editingId.value) return;

  await store.updateUser(editingId.value, editName.value, editEmail.value);

  cancelEdit();
};
</script>

<template>
  <main style="max-width: 600px; margin: 2rem auto; font-family: system-ui;">

    <!-- CREATE USER -->
    <section class="mb-8 bg-gray-50 border border-gray-200 p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Neuen User anlegen
      </h2>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="Name eingeben"
            class="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2
                   placeholder:text-gray-400 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            E-Mail
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="E-Mail eingeben"
            class="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2
                   placeholder:text-gray-400 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
          />
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2
                 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!name || !email"
        >
          Erstellen
        </button>
      </form>
    </section>

    <!-- USER LIST -->
    <section class="bg-gray-50 border border-gray-200 p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">
          Benutzerliste
        </h2>
        <span class="text-xs text-gray-500">
          {{ store.users.value.length }} Benutzer
        </span>
      </div>

      <!-- Loading -->
      <div v-if="store.loading.value" class="text-sm text-gray-500">
        Lade…
      </div>

      <!-- Error -->
      <div v-if="store.error.value" class="text-sm text-red-600 font-semibold">
        {{ store.error }}
      </div>

      <!-- User List -->
      <ul
        v-if="store.users.value.length"
        class="divide-y divide-gray-200"
      >
        <li
          v-for="u in store.users.value"
          :key="u.id"
          class="py-4"
        >

          <!-- EDIT MODE -->
          <div v-if="editingId === u.id" class="space-y-3">

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                v-model="editName"
                class="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">E-Mail</label>
              <input
                v-model="editEmail"
                class="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>

            <div class="flex gap-2">
              <button
                @click="onUpdate"
                class="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm"
              >
                Speichern
              </button>

              <button
                @click="cancelEdit"
                class="bg-gray-300 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm"
              >
                Abbrechen
              </button>
            </div>
          </div>

          <!-- NORMAL MODE -->
          <div v-else class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-800">{{ u.name }}</p>
              <p class="text-xs text-gray-500">{{ u.email }}</p>
            </div>

            <div class="flex gap-2">
              <button
                @click="startEdit(u)"
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm"
              >
                Bearbeiten
              </button>

              <button
                @click="onDelete(u.id)"
                class="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm"
              >
                Löschen
              </button>
            </div>
          </div>

        </li>
      </ul>

      <!-- Empty State -->
      <p
        v-else
        class="text-sm text-gray-500 italic"
      >
        Keine Benutzer vorhanden.
      </p>
    </section>
  </main>
</template>
