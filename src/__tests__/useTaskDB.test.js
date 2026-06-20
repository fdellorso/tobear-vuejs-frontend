import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskDB } from '@/idb/useTaskDB'

describe('useTaskDB', () => {
  let taskDB

  beforeEach(async () => {
    taskDB = useTaskDB()
    await taskDB.clearTasks()
  })

  describe('saveTask / getAllTasks', () => {
    it('should save and retrieve a single task', async () => {
      const task = { id: '1', title: 'Test task', order: 1 }
      await taskDB.saveTask(task)
      const all = await taskDB.getAllTasks()
      expect(all).toHaveLength(1)
      expect(all[0]).toEqual(task)
    })

    it('should return tasks sorted by order', async () => {
      const task2 = { id: '2', title: 'Second', order: 2 }
      const task1 = { id: '1', title: 'First', order: 1 }
      await taskDB.saveTask(task2)
      await taskDB.saveTask(task1)
      const all = await taskDB.getAllTasks()
      expect(all).toHaveLength(2)
      expect(all[0].id).toBe('1')
      expect(all[1].id).toBe('2')
    })
  })

  describe('saveTasks (batch)', () => {
    it('should save multiple tasks in a single transaction', async () => {
      const tasks = [
        { id: '1', title: 'Task 1', order: 1 },
        { id: '2', title: 'Task 2', order: 2 },
        { id: '3', title: 'Task 3', order: 3 },
      ]
      await taskDB.saveTasks(tasks)
      const all = await taskDB.getAllTasks()
      expect(all).toHaveLength(3)
    })
  })

  describe('deleteTask', () => {
    it('should remove a task by id', async () => {
      await taskDB.saveTask({ id: '1', title: 'To delete', order: 1 })
      await taskDB.saveTask({ id: '2', title: 'Keep me', order: 2 })
      await taskDB.deleteTask('1')
      const all = await taskDB.getAllTasks()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe('2')
    })

    it('should not throw when deleting a non-existent id', async () => {
      await expect(taskDB.deleteTask('nonexistent')).resolves.toBeUndefined()
    })
  })

  describe('clearTasks', () => {
    it('should empty the store', async () => {
      await taskDB.saveTask({ id: '1', title: 'Task', order: 1 })
      await taskDB.clearTasks()
      const all = await taskDB.getAllTasks()
      expect(all).toHaveLength(0)
    })

    it('should work on an already empty store', async () => {
      await expect(taskDB.clearTasks()).resolves.toBeUndefined()
    })
  })

  describe('pending reorder', () => {
    it('savePendingReorder / getPendingReorder should roundtrip', async () => {
      const ids = ['a', 'b', 'c']
      await taskDB.savePendingReorder(ids)
      const result = await taskDB.getPendingReorder()
      expect(result).toEqual(ids)
    })

    it('getPendingReorder should return null when no reorder is saved', async () => {
      const result = await taskDB.getPendingReorder()
      expect(result).toBeNull()
    })

    it('clearPendingReorder should remove the entry', async () => {
      await taskDB.savePendingReorder(['a', 'b'])
      await taskDB.clearPendingReorder()
      const result = await taskDB.getPendingReorder()
      expect(result).toBeNull()
    })

    it('getAllTasks should NOT include the sentinel entry', async () => {
      await taskDB.saveTask({ id: 'real-1', title: 'Real task', order: 1 })
      await taskDB.savePendingReorder(['x', 'y'])
      const all = await taskDB.getAllTasks()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe('real-1')
    })
  })
})
