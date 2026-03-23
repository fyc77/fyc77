<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">
        <h1>广西旅游管理系统</h1>
      </div>
      <nav class="menu">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/scenic">
          <el-icon><Map /></el-icon>
          <span>景点管理</span>
        </el-menu-item>
        <el-menu-item index="/travel-guide">
          <el-icon><Document /></el-icon>
          <span>攻略管理</span>
        </el-menu-item>
        <el-menu-item index="/user-message">
          <el-icon><ChatLineSquare /></el-icon>
          <span>留言管理</span>
        </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="/log">
            <el-icon><Reading /></el-icon>
            <span>系统日志</span>
          </el-menu-item>
        </el-menu>
      </nav>
    </aside>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="top-nav">
        <div class="nav-left">
          <el-button type="text" @click="toggleSidebar">
            <el-icon><Menu /></el-icon>
          </el-button>
        </div>
        <div class="nav-right">
          <el-dropdown>
            <span class="user">
              <el-avatar :size="32" :src="userAvatar"></el-avatar>
              <span class="user-name">{{ userName }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="navigateToProfile">
                  <el-icon><User /></el-icon>
                  <span>个人设置</span>
                </el-dropdown-item>
                <el-dropdown-item @click="logout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 内容区域 -->
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { House, Place, Document, ChatLineRound, DataAnalysis, Reading, Menu, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const activeMenu = ref('/')
const userName = ref('管理员')
const userAvatar = ref('')

// 处理菜单选择
const handleMenuSelect = (key) => {
  activeMenu.value = key
  router.push(key)
}

// 切换侧边栏
const toggleSidebar = () => {
  const sidebar = document.querySelector('.sidebar')
  sidebar.classList.toggle('collapsed')
  const mainContent = document.querySelector('.main-content')
  mainContent.classList.toggle('expanded')
}

// 跳转到个人设置
const navigateToProfile = () => {
  router.push('/profile')
}

// 退出登录
const logout = async () => {
  try {
    await axios.post('/api/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
    ElMessage.success('退出登录成功')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  }
}

// 获取当前用户信息
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    
    const response = await axios.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data.code === 200) {
      userName.value = response.data.data.admin.name
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 计算当前激活的菜单
const currentPath = computed(() => {
  return router.currentRoute.value.path
})

// 生命周期钩子
onMounted(() => {
  activeMenu.value = currentPath.value
  getCurrentUser()
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background-color: #2c786c;
  color: white;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.sidebar.collapsed .logo h1 {
  display: none;
}

.menu {
  padding-top: 20px;
}

.el-menu-vertical-demo {
  background-color: transparent;
  border-right: none;
}

.el-menu-item {
  color: rgba(255, 255, 255, 0.8);
  height: 60px;
  line-height: 60px;
  margin: 0 10px;
  border-radius: 8px;
}

.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.sidebar.collapsed .el-menu-item span {
  display: none;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: -176px;
}

/* 顶部导航 */
.top-nav {
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-left .el-button {
  color: #333;
}

.user {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name {
  margin-left: 10px;
  margin-right: 5px;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    left: -240px;
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style>