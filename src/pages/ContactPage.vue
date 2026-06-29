<template>
  <div class="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
    <div
      class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      aria-hidden="true"
    >
      <div
        class="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-288.75"
        style="
          clip-path: polygon(
            74.1% 44.1%,
            100% 61.6%,
            97.5% 26.9%,
            85.5% 0.1%,
            80.7% 2%,
            72.5% 32.5%,
            60.2% 62.4%,
            52.4% 68.1%,
            47.5% 58.3%,
            45.2% 34.5%,
            27.5% 76.7%,
            0.1% 64.9%,
            17.9% 100%,
            27.6% 76.8%,
            76.1% 97.7%,
            74.1% 44.1%
          );
        "
      />
    </div>

    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
        Contattaci
      </h2>
      <p class="mt-2 text-lg/8 text-gray-600">
        Un problema, un suggerimento, o solo un saluto — scrivici pure.
      </p>
    </div>

    <div
      v-if="submitted"
      class="mx-auto mt-16 max-w-xl rounded-lg bg-green-50 p-8 text-center sm:mt-20"
    >
      <p class="text-lg font-semibold text-green-800">Grazie!</p>
      <p class="mt-2 text-green-700">Ti risponderemo al più presto.</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="mx-auto mt-16 max-w-xl sm:mt-20">
      <div class="grid grid-cols-1 gap-x-8 gap-y-6">
        <div>
          <label for="nome" class="block text-sm/6 font-semibold text-gray-900">Nome</label>
          <div class="mt-2.5">
            <input
              id="nome"
              v-model="nome"
              type="text"
              autocomplete="name"
              class="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
              placeholder="Il tuo nome (opzionale)"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm/6 font-semibold text-gray-900">
            Email <span class="text-red-500">*</span>
          </label>
          <div class="mt-2.5">
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              class="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>
          <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-500">{{ fieldErrors.email }}</p>
        </div>

        <div>
          <label for="messaggio" class="block text-sm/6 font-semibold text-gray-900">
            Messaggio <span class="text-red-500">*</span>
          </label>
          <div class="mt-2.5">
            <textarea
              id="messaggio"
              v-model="messaggio"
              rows="4"
              class="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>
          <p v-if="fieldErrors.messaggio" class="mt-1 text-sm text-red-500">
            {{ fieldErrors.messaggio }}
          </p>
        </div>
      </div>

      <p v-if="errorMessage" class="mt-6 rounded-md bg-red-50 p-3 text-center text-sm text-red-700">
        {{ errorMessage }}
      </p>

      <div class="mt-10">
        <button
          type="submit"
          :disabled="loading"
          class="block w-full rounded-md bg-blue-800 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span v-if="loading">Invio in corso…</span>
          <span v-else>Invia messaggio</span>
        </button>
      </div>
    </form>

    <div class="mx-auto mt-10 max-w-xl text-center text-sm text-gray-500">
      <p>
        Preferisci segnalare un bug tecnico?
        <a
          href="#"
          class="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-700"
          >Apri una issue su GitHub</a
        >
        <!-- TODO: sostituire href con URL del repository pubblico -->
      </p>
    </div>
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

<style scoped></style>
