<template>
  <div class="mx-auto max-w-2xl text-center">
    <h2 class="text-4xl font-semibold tracking-tight text-balance text-tb-text sm:text-5xl">
      Contattaci
    </h2>
    <p class="mt-2 text-lg/8 text-tb-text-sec">
      Un problema, un suggerimento, o solo un saluto — scrivici pure.
    </p>
  </div>

  <div
    v-if="submitted"
    class="mx-auto mt-16 max-w-xl rounded-lg bg-tb-success-bg p-8 text-center sm:mt-20"
  >
    <p class="text-lg font-semibold text-tb-success">Grazie!</p>
    <p class="mt-2 text-tb-success">Ti risponderemo al più presto.</p>
  </div>

  <form v-else @submit.prevent="handleSubmit" class="mx-auto mt-16 max-w-xl sm:mt-20">
    <div class="grid grid-cols-1 gap-x-8 gap-y-6">
      <div>
        <label for="nome" class="block text-sm/6 font-semibold text-tb-text">Nome</label>
        <div class="mt-2.5">
          <input
            id="nome"
            v-model="nome"
            type="text"
            autocomplete="name"
            class="block w-full rounded-md bg-tb-surface px-3.5 py-2 text-base text-tb-text outline-1 -outline-offset-1 outline-tb-border placeholder:text-tb-text-muted focus:outline-2 focus:-outline-offset-2 focus:outline-tb-accent"
            placeholder="Il tuo nome (opzionale)"
          />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm/6 font-semibold text-tb-text">
          Email <span class="text-tb-danger">*</span>
        </label>
        <div class="mt-2.5">
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            class="block w-full rounded-md bg-tb-surface px-3.5 py-2 text-base text-tb-text outline-1 -outline-offset-1 outline-tb-border placeholder:text-tb-text-muted focus:outline-2 focus:-outline-offset-2 focus:outline-tb-accent"
          />
        </div>
        <p v-if="fieldErrors.email" class="mt-1 text-sm text-tb-danger">{{ fieldErrors.email }}</p>
      </div>

      <div>
        <label for="messaggio" class="block text-sm/6 font-semibold text-tb-text">
          Messaggio <span class="text-tb-danger">*</span>
        </label>
        <div class="mt-2.5">
          <textarea
            id="messaggio"
            v-model="messaggio"
            rows="4"
            class="block w-full rounded-md bg-tb-surface px-3.5 py-2 text-base text-tb-text outline-1 -outline-offset-1 outline-tb-border placeholder:text-tb-text-muted focus:outline-2 focus:-outline-offset-2 focus:outline-tb-accent"
          />
        </div>
        <p v-if="fieldErrors.messaggio" class="mt-1 text-sm text-tb-danger">
          {{ fieldErrors.messaggio }}
        </p>
      </div>
    </div>

    <p
      v-if="errorMessage"
      class="mt-6 rounded-md bg-tb-danger-bg p-3 text-center text-sm text-tb-danger"
    >
      {{ errorMessage }}
    </p>

    <div class="mt-10">
      <button
        type="submit"
        :disabled="loading"
        class="block w-full rounded-md bg-tb-accent px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-tb-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tb-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span v-if="loading">Invio in corso…</span>
        <span v-else>Invia messaggio</span>
      </button>
    </div>
  </form>

  <div class="mx-auto mt-10 max-w-xl text-center text-sm text-tb-text-muted">
    <p>
      Preferisci segnalare un bug tecnico?
      <a
        href="#"
        class="font-semibold text-tb-accent underline underline-offset-2 hover:text-tb-accent"
        >Apri una issue su GitHub</a
      >
      <!-- TODO: sostituire href con URL del repository pubblico -->
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { axiosClient, withCSRF } from '@/axios'

const nome = ref('')
const email = ref('')
const messaggio = ref('')
const loading = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const fieldErrors = reactive({
  email: '',
  messaggio: '',
})

function validate() {
  fieldErrors.email = ''
  fieldErrors.messaggio = ''

  if (!email.value) {
    fieldErrors.email = "L'email è obbligatoria."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    fieldErrors.email = 'Inserisci un indirizzo email valido.'
  }

  if (!messaggio.value) {
    fieldErrors.messaggio = 'Il messaggio è obbligatorio.'
  }

  return !fieldErrors.email && !fieldErrors.messaggio
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await withCSRF(() =>
      axiosClient.post('/v1/contact', {
        name: nome.value || undefined,
        email: email.value,
        message: messaggio.value,
      }),
    )
    submitted.value = true
  } catch (error) {
    if (error.response?.status === 429) {
      errorMessage.value = 'Hai inviato troppi messaggi, riprova più tardi.'
    } else {
      errorMessage.value =
        error.response?.data?.message || "Errore nell'invio del messaggio. Riprova."
    }
  } finally {
    loading.value = false
  }
}
</script>
