import { openDB } from 'idb'

const DB_NAME = 'tobear-db'
const DB_VERSION = 1
const STORE_NAME = 'tasks'

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('by_title', 'title')
        }
      },
    })
  }
  return dbPromise
}

export function useTaskDB() {
  async function getAllTasks() {
    const db = await getDB()
    return db.getAll(STORE_NAME)
  }

  async function saveTask(task) {
    const db = await getDB()
    return db.put(STORE_NAME, task)
  }

  async function saveTasks(tasks) {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    for (const task of tasks) {
      tx.store.put(task)
    }
    await tx.done
  }

  async function clearTasks() {
    const db = await getDB()
    return db.clear(STORE_NAME)
  }

  return {
    getAllTasks,
    saveTask,
    saveTasks,
    clearTasks,
  }
}
