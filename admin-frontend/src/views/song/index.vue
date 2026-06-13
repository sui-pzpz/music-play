<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getSongs, updateSongStatus, deleteSong } from '@/api/song'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const songList = ref<any[]>([])
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})
const stats = ref({
  totalSongs: 0,
  onlineSongs: 0,
  offlineSongs: 0,
  vipSongs: 0
})

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
  isVip: undefined as number | undefined,
  sortBy: 'created_at',
  sortOrder: 'desc'
})

onMounted(() => {
  fetchSongs()
})

async function fetchSongs() {
  loading.value = true
  try {
    const data = await getSongs({
      page: pagination.page,
      size: pagination.size,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status,
      isVip: searchForm.isVip,
      sortBy: searchForm.sortBy,
      sortOrder: searchForm.sortOrder
    }) as any
    songList.value = data.list
    pagination.total = data.pagination.total
    if (data.statistics) {
      stats.value = data.statistics
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchSongs()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = undefined
  searchForm.isVip = undefined
  searchForm.sortBy = 'created_at'
  searchForm.sortOrder = 'desc'
  handleSearch()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchSongs()
}

function handleSizeChange(size: number) {
  pagination.size = size
  pagination.page = 1
  fetchSongs()
}

async function handleToggleStatus(row: any) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定要${action}歌曲 ${row.name} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateSongStatus(row.songId, newStatus)
    ElMessage.success(`${action}成功`)
    fetchSongs()
  } catch {
    // cancelled
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除歌曲 ${row.name} 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    await deleteSong(row.songId)
    ElMessage.success('删除成功')
    fetchSongs()
  } catch {
    // cancelled
  }
}

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}
</script>

<template>
  <div>
    <h2>歌曲管理</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <span class="stat-label">总歌曲数</span>
            <span class="stat-value">{{ stats.totalSongs }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <span class="stat-label">上架歌曲</span>
            <span class="stat-value success">{{ stats.onlineSongs }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <span class="stat-label">下架歌曲</span>
            <span class="stat-value danger">{{ stats.offlineSongs }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <span class="stat-label">VIP歌曲</span>
            <span class="stat-value warning">{{ stats.vipSongs }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card style="margin-bottom: 20px">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="歌名/歌曲ID"
            clearable
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.isVip" placeholder="全部" clearable>
            <el-option label="免费" :value="0" />
            <el-option label="VIP" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="searchForm.sortBy">
            <el-option label="创建时间" value="created_at" />
            <el-option label="播放次数" value="play_count" />
            <el-option label="歌名" value="name" />
          </el-select>
          <el-select v-model="searchForm.sortOrder" style="margin-left: 8px">
            <el-option label="降序" value="desc" />
            <el-option label="升序" value="asc" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 歌曲列表 -->
    <el-card>
      <el-table :data="songList" v-loading="loading" style="width: 100%">
        <el-table-column prop="songId" label="歌曲ID" width="150" />
        <el-table-column prop="name" label="歌名" min-width="150" />
        <el-table-column label="歌手" width="150">
          <template #default="{ row }">
            <span v-if="row.artists && row.artists.length">
              {{ row.artists.map((a: any) => a.name).join(', ') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="时长" width="80">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="playCount" label="播放次数" width="100" />
        <el-table-column label="VIP" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.isVip" type="warning" size="small">VIP</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
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

<style scoped>
.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-value.success {
  color: #67C23A;
}

.stat-value.danger {
  color: #F56C6C;
}

.stat-value.warning {
  color: #E6A23C;
}
</style>
