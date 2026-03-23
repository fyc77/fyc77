import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../components/Layout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('../views/Home.vue'),
          meta: { title: '首页' }
        },
        // 景点管理
        {
          path: 'scenic',
          name: 'Scenic',
          component: () => import('../views/Scenic.vue'),
          meta: { title: '景点管理' }
        },
        // 攻略管理
        {
          path: 'travel-guide',
          name: 'TravelGuide',
          component: () => import('../views/TravelGuide.vue'),
          meta: { title: '攻略管理' }
        },
        // 留言管理
        {
          path: 'user-message',
          name: 'UserMessage',
          component: () => import('../views/UserMessage.vue'),
          meta: { title: '留言管理' }
        },
        // 数据统计
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('../views/Statistics.vue'),
          meta: { title: '数据统计' }
        },
        // 系统日志
        // {
        //   path: 'log',
        //   name: 'Log',
        //   component: () => import('../views/Log.vue'),
        //   meta: { title: '系统日志' }
        // },
        // //个人设置
        // {
        //   path: 'profile',
        //   name: 'Profile',
        //   component: () => import('../views/Profile.vue'),
        //   meta: { title: '个人设置' }
        // }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 广西旅游后台管理系统`
  
  // 检查登录状态
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router