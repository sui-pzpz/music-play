<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'
import {
  DataAnalysis,
  User,
  Headset,
  Document,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isCollapse = ref(false)

const menuItems = [
  { path: '/dashboard', icon: DataAnalysis, title: '数据概览' },
  { path: '/users', icon: User, title: '用户管理' },
  { path: '/songs', icon: Headset, title: '歌曲管理' },
  { path: '/logs', icon: Document, title: '操作日志' }
]

onMounted(async () => {
  try {
    await authStore.getProfile()
  } catch {
    // ignore
  }
})

function handleMenuClick(path: string) {
  router.push(path)
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    authStore.logout()
    router.push('/login')
  } catch {
    // cancelled
  }
}
</script>

<template>
  <el-container style="height: 100%">
    <el-aside :width="isCollapse ? '64px' : '200px'" style="background-color: #304156">
      <div class="logo" :class="{ collapsed: isCollapse }">
        <span v-if="!isCollapse">音乐管理平台</span>
        <span v-else>音乐</span>
      </div>
      <el-menu
        :default-active="route.path"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="(path: string) => handleMenuClick(path)"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee">
        <el-button :icon="isCollapse ? 'Expand' : 'Fold'" @click="isCollapse = !isCollapse" />
        <div style="display: flex; align-items: center; gap: 16px">
          <span>{{ authStore.adminInfo?.nickname || authStore.adminInfo?.username }}</span>
          <el-button :icon="SwitchButton" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
}

.logo.collapsed {
  font-size: 14px;
}
</style>
