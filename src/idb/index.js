import { openDB } from 'idb'

const dbPromise = openDB('tobear-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('todos')) {
      db.createObjectStore('todos', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('sync-queue')) {
      db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true })
    }
  },
})

export const addTodo = async (todo) => {
  const db = await dbPromise
  await db.put('todos', todo)
}

export const getTodos = async () => {
  const db = await dbPromise
  return await db.getAll('todos')
}

export const queueSync = async (data) => {
  const db = await dbPromise
  await db.add('sync-queue', data)
}

export const getQueuedSyncItems = async () => {
  const db = await dbPromise
  return await db.getAll('sync-queue')
}

export const clearSyncQueue = async () => {
  const db = await dbPromise
  const tx = db.transaction('sync-queue', 'readwrite')
  await tx.store.clear()
  await tx.done
}
