<template>
  <div class="login-container">
    <div class="login-form">
      <h1>广西旅游后台管理系统</h1>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            @click="login"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const loginForm = reactive({
  username: '',
  password: ''
})
const loading = ref(false)
// ✅ 绑定表单ref，解决校验+输入问题
const loginFormRef = ref(null)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// ✅ 修复后的完整登录方法
const login = async () => {
  // 先做表单校验，确保拿到正确的账号密码
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const response = await axios.post('/api/auth/login', loginForm)
      if (response.data.code === 200) {
        const { token, admin } = response.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(admin))
        ElMessage.success('登录成功')
        router.push('/')
      } else {
        ElMessage.error(response.data.message)
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-form {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-form h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c786c;
  font-size: 24px;
  font-weight: bold;
}

.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
  background-color: #2c786c;
  border-color: #2c786c;
}

.login-btn:hover {
  background-color: #1e5a56;
  border-color: #1e5a56;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-form {
    width: 90%;
    padding: 30px;
  }
}
</style>