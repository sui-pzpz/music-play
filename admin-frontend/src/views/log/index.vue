<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getLogs } from '@/api/log'

const loading = ref(false)
const logList = ref<any[]>([])
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

onMounted(() => {
  fetchLogs()
})

async function fetchLogs() {
  loading.value = true
  try {
    const data = await getLogs({
      page: pagination.page,
      size: pagination.size
    }) as any
    logList.value = data.list
    pagination.total = data.pagination.total
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchLogs()
}

function handleSizeChange(size: number) {
  pagination.size = size
  pagination.page = 1
  fetchLogs()
}

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

function getTargetTypeLabel(type: string) {
  const map: Record<string, string> = {
    'user': '用户',
    'song': '歌曲',
    'playlist': '歌单'
  }
  return map[type] || type
}
</script>

<template>
  <div>
    <h2>操作日志</h2>

    <el-card>
      <el-table :data="logList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="adminUsername" label="操作人" width="120" />
        <el-table-column prop="action" label="操作类型" width="150">
          <template #default="{ row }">
            {{ getActionLabel(row.action) }}
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="对象类型" width="100">
          <template #default="{ row }">
            {{ getTargetTypeLabel(row.targetType) }}
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="对象ID" width="150" />
        <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="createdAt" label="操作时间" width="180" />
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>
