import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTaskDB } from '@/idb/useTaskDB'

vi.mock('@/axios', () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { axiosClient } from '@/axios'
import { migrateGuestTasks } from '@/composables/useGuestMigration'

describe('migrateGuestTasks', () => {
  let taskDB

  beforeEach(async () => {
    taskDB = useTaskDB()
    await taskDB.clearTasks()
    vi.clearAllMocks()
  })

  it('should do nothing when no local tasks exist', async () => {
    await taskDB.saveTask({ id: 1, title: 'Remote task', order: 1 })
    await migrateGuestTasks()
    const all = await taskDB.getAllTasks()
    expect(all).toHaveLength(1)
    expect(axiosClient.get).not.toHaveBeenCalled()
    expect(axiosClient.post).not.toHaveBeenCalled()
  })

  it('should delete pendingDelete tasks from IDB without POST', async () => {
    axiosClient.get.mockResolvedValue({ data: { data: [] } })
    await taskDB.saveTask({ id: 'local-1', title: 'Deleted task', pendingDelete: true })
    await migrateGuestTasks()
    const all = await taskDB.getAllTasks()
    expect(all.filter((t) => String(t.id).startsWith('local-'))).toHaveLength(0)
    expect(axiosClient.post).not.toHaveBeenCalled()
  })

  it('should create completed task with completed=true when pendingComplete', async () => {
    axiosClient.get.mockResolvedValue({ data: { data: [] } })
    axiosClient.post.mockResolvedValue({
      status: 201,
      data: { data: { id: 101, title: 'Completed task', completed: true, order: 1 } },
    })

    await taskDB.saveTask({
      id: 'local-1',
      title: 'Completed task',
      completed: true,
      pendingComplete: true,
    })

    await migrateGuestTasks()

    expect(axiosClient.get).toHaveBeenCalledWith('/v1/tasks')
    expect(axiosClient.post).toHaveBeenCalledWith('/v1/tasks', {
      title: 'Completed task',
      description: '',
      completed: true,
      order: 1,
    })

    const all = await taskDB.getAllTasks()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe(101)
    expect(all[0].completed).toBe(true)
    expect(all[0].title).toBe('Completed task')
  })

  it('should migrate pure creation without completed flag', async () => {
    axiosClient.get.mockResolvedValue({ data: { data: [] } })
    axiosClient.post.mockResolvedValue({
      status: 201,
      data: { data: { id: 201, title: 'Pure task', completed: false, order: 1 } },
    })

    await taskDB.saveTask({ id: 'local-2', title: 'Pure task' })

    await migrateGuestTasks()

    expect(axiosClient.post).toHaveBeenCalledWith('/v1/tasks', {
      title: 'Pure task',
      description: '',
      completed: false,
      order: 1,
    })

    const all = await taskDB.getAllTasks()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe(201)
  })

  it('should handle all three cases in one migration', async () => {
    axiosClient.get.mockResolvedValue({ data: { data: [] } })
    axiosClient.post.mockImplementation((url, payload) => {
      if (payload.title === 'T1') {
        return Promise.resolve({
          status: 201,
          data: { data: { id: 301, title: 'T1', completed: true, order: 1 } },
        })
      }
      if (payload.title === 'T3') {
        return Promise.resolve({
          status: 201,
          data: { data: { id: 303, title: 'T3', completed: false, order: 2 } },
        })
      }
      return Promise.reject(new Error('unexpected'))
    })

    await taskDB.saveTask({ id: 'local-1', title: 'T1', completed: true, pendingComplete: true })
    await taskDB.saveTask({ id: 'local-2', title: 'T2', pendingDelete: true })
    await taskDB.saveTask({ id: 'local-3', title: 'T3' })

    await migrateGuestTasks()

    const all = await taskDB.getAllTasks()
    expect(all).toHaveLength(2)
    expect(all.find((t) => t.title === 'T1')?.completed).toBe(true)
    expect(all.find((t) => t.title === 'T3')).toBeTruthy()
    expect(all.find((t) => t.title === 'T2')).toBeFalsy()
    expect(all.some((t) => String(t.id).startsWith('local-'))).toBe(false)
  })

  it('should respect remote maxOrder when computing order', async () => {
    axiosClient.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, order: 5 },
          { id: 2, order: 10 },
        ],
      },
    })
    axiosClient.post.mockResolvedValue({
      status: 201,
      data: { data: { id: 401, title: 'New', completed: false, order: 11 } },
    })

    await taskDB.saveTask({ id: 'local-1', title: 'New', order: 0 })

    await migrateGuestTasks()

    expect(axiosClient.post).toHaveBeenCalledWith('/v1/tasks', {
      title: 'New',
      description: '',
      completed: false,
      order: 11,
    })
  })

  it('should fail-fast on first POST error and keep remaining local tasks', async () => {
    axiosClient.get.mockResolvedValue({ data: { data: [] } })
    axiosClient.post
      .mockResolvedValueOnce({
        status: 201,
        data: { data: { id: 501, title: 'T1', completed: false, order: 1 } },
      })
      .mockRejectedValueOnce(new Error('Network error'))

    await taskDB.saveTask({ id: 'local-a', title: 'T1' })
    await taskDB.saveTask({ id: 'local-b', title: 'T2' })

    await migrateGuestTasks()

    const all = await taskDB.getAllTasks()
    expect(all.find((t) => t.id === 501)).toBeTruthy()
    expect(all.find((t) => t.id === 'local-b')).toBeTruthy()
    expect(axiosClient.post).toHaveBeenCalledTimes(2)
  })

  it('should skip migration if fetching remote tasks fails', async () => {
    axiosClient.get.mockRejectedValue(new Error('Network error'))

    await taskDB.saveTask({ id: 'local-1', title: 'Task' })

    await migrateGuestTasks()

    const all = await taskDB.getAllTasks()
    expect(all).toHaveLength(1)
    expect(String(all[0].id)).toBe('local-1')
    expect(axiosClient.post).not.toHaveBeenCalled()
  })
})
