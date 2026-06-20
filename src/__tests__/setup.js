import {
  indexedDB,
  IDBKeyRange,
  IDBTransaction,
  IDBCursor,
  IDBRequest,
  IDBOpenDBRequest,
  IDBDatabase,
  IDBObjectStore,
  IDBIndex,
  IDBVersionChangeEvent,
} from 'fake-indexeddb'

globalThis.indexedDB = indexedDB
globalThis.IDBKeyRange = IDBKeyRange
globalThis.IDBTransaction = IDBTransaction
globalThis.IDBCursor = IDBCursor
globalThis.IDBRequest = IDBRequest
globalThis.IDBOpenDBRequest = IDBOpenDBRequest
globalThis.IDBDatabase = IDBDatabase
globalThis.IDBObjectStore = IDBObjectStore
globalThis.IDBIndex = IDBIndex
globalThis.IDBVersionChangeEvent = IDBVersionChangeEvent
