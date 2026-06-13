import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

interface AdminInfo {
  adminId: number
  username: string
  nickname: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('admin_token') || '')
  const adminInfo = ref<AdminInfo | null>(null)

  async function login(username: string, password: string) {
    const data = await request.post('/login', { username, password }) as any
    token.value = data.token
    adminInfo.value = {
      adminId: data.adminId,
      username: data.username,
      nickname: data.nickname,
      role: data.role
    }
    localStorage.setItem('admin_token', data.token)
    return data
  }

  async function getProfile() {
    const data = await request.get('/profile') as any
    adminInfo.value = {
      adminId: data.adminId,
      username: data.username,
      nickname: data.nickname,
      role: data.role
    }
    return data
  }

  function logout() {
    token.value = ''
    adminInfo.value = null
    localStorage.removeItem('admin_token')
  }

  return {
    token,
    adminInfo,
    login,
    getProfile,
    logout
  }
})
