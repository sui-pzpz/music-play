<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboard } from '@/api/dashboard'
import { DataAnalysis, User, Headset, VideoPlay } from '@element-plus/icons-vue'

const stats = ref({
  totalUsers: 0,
  todayNewUsers: 0,
  totalSongs: 0,
  activeSongs: 0,
  totalPlaylists: 0,
  todayPlayCount: 0,
  recentActions: [] as any[]
})

const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const data = await getDashboard() as any
    stats.value = data
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})

function getActionLabel(action: string) {
  const map: Record<string, string> = {
    'update_user_status': '更新用户状态',
    'delete_user': '删除用户',
    'update_user': '编辑用户',
    'create_song': '新增歌曲',
    'update_song': '编辑歌曲',
    'update_song_status': '更新歌曲状态',
    'delete_song': '删除歌曲'
  }
  return map[action] || action
}
</script>

<template>
  <div v-loading="loading">
    <h2>数据概览</h2>
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon><User /></el-icon>
              <span>总用户数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalUsers }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon><User /></el-icon>
              <span>今日新增用户</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.todayNewUsers }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon><Headset /></el-icon>
              <span>总歌曲数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalSongs }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon><VideoPlay /></el-icon>
              <span>今日播放次数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.todayPlayCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <span>最近操作记录</span>
      </template>
      <el-table :data="stats.recentActions" style="width: 100%">
        <el-table-column prop="adminUsername" label="操作人" width="120" />
        <el-table-column prop="action" label="操作类型" width="150">
          <template #default="{ row }">
            {{ getActionLabel(row.action) }}
          </template>
        </el-table-column>
        <el-table-column prop="target" label="操作对象" />
        <el-table-column prop="time" label="操作时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
}
</style>
