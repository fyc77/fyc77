<template>
  <div class="home">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon scenic">
            <el-icon><Place /></el-icon>
          </div>
          <div class="stat-info">
            <h3>景点总数</h3>
            <p class="stat-number">{{ statistics.scenic.total }}</p>
            <p class="stat-desc">在线景点: {{ statistics.scenic.online }}</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon guide">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <h3>攻略总数</h3>
            <p class="stat-number">{{ statistics.guide.total }}</p>
            <p class="stat-desc">已通过: {{ statistics.guide.approved }}</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon message">
            <el-icon><ChatLineRound /></el-icon>
          </div>
          <div class="stat-info">
            <h3>留言总数</h3>
            <p class="stat-number">{{ statistics.message.total }}</p>
            <p class="stat-desc">待审核: {{ statistics.message.pending }}</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon views">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-info">
            <h3>总访问量</h3>
            <p class="stat-number">{{ totalViews }}</p>
            <p class="stat-desc">景点: {{ statistics.scenic.views }} | 攻略: {{ statistics.guide.views }}</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 趋势图表 -->
    <div class="charts">
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>访问量趋势</span>
            <el-select v-model="chartType" size="small" @change="loadChartData">
              <el-option label="景点访问量" value="scenic_views"></el-option>
              <el-option label="攻略阅读量" value="guide_views"></el-option>
            </el-select>
          </div>
        </template>
        <div ref="viewsChart" class="chart"></div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>内容发布趋势</span>
            <el-select v-model="contentType" size="small" @change="loadContentChartData">
              <el-option label="攻略发布" value="guides"></el-option>
              <el-option label="留言数量" value="messages"></el-option>
            </el-select>
          </div>
        </template>
        <div ref="contentChart" class="chart"></div>
      </el-card>
    </div>
    
    <!-- 热门内容 -->
    <div class="hot-content">
      <el-card class="hot-card">
        <template #header>
          <span>热门景点</span>
        </template>
        <el-table :data="hotScenic" stripe style="width: 100%">
          <el-table-column prop="name" label="景点名称" width="180"></el-table-column>
          <el-table-column prop="address" label="地址"></el-table-column>
          <el-table-column prop="views" label="访问量" width="100"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <el-card class="hot-card">
        <template #header>
          <span>热门攻略</span>
        </template>
        <el-table :data="hotGuides" stripe style="width: 100%">
          <el-table-column prop="title" label="标题" width="200"></el-table-column>
          <el-table-column prop="scenic.name" label="关联景点" width="150"></el-table-column>
          <el-table-column prop="views" label="阅读量" width="100"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { Place, Document, ChatLineRound, View } from '@element-plus/icons-vue'
import axios from 'axios'

// 统计数据
const statistics = ref({
  scenic: { total: 0, online: 0, views: 0 },
  guide: { total: 0, approved: 0, views: 0, favorites: 0, likes: 0 },
  message: { total: 0, pending: 0 }
})

// 图表类型
const chartType = ref('scenic_views')
const contentType = ref('guides')

// 热门内容
const hotScenic = ref([])
const hotGuides = ref([])

// 图表实例
let viewsChartInstance = null
let contentChartInstance = null

// 计算总访问量
const totalViews = computed(() => {
  return statistics.value.scenic.views + statistics.value.guide.views
})

// 获取核心统计数据
const getCoreStatistics = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/statistics/core', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data.code === 200) {
      statistics.value = response.data.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取热门景点
const getHotScenicSpots = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/statistics/hot-scenic', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data.code === 200) {
      hotScenic.value = response.data.data
    }
  } catch (error) {
    console.error('获取热门景点失败:', error)
  }
}

// 获取热门攻略
const getHotGuides = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/statistics/hot-guide', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data.code === 200) {
      hotGuides.value = response.data.data
    }
  } catch (error) {
    console.error('获取热门攻略失败:', error)
  }
}

// 加载访问量趋势数据
const loadChartData = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/statistics/trend', {
      params: { type: chartType.value, days: 7 },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data.code === 200) {
      const { dates, values } = response.data.data
      updateViewsChart(dates, values)
    }
  } catch (error) {
    console.error('获取趋势数据失败:', error)
  }
}

// 加载内容发布趋势数据
const loadContentChartData = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/statistics/trend', {
      params: { type: contentType.value, days: 7 },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data.code === 200) {
      const { dates, values } = response.data.data
      updateContentChart(dates, values)
    }
  } catch (error) {
    console.error('获取趋势数据失败:', error)
  }
}

// 更新访问量图表
const updateViewsChart = (dates, values) => {
  if (!viewsChartInstance) {
    viewsChartInstance = echarts.init(document.querySelector('.chart'))
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#2c786c'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(44, 120, 108, 0.3)' },
          { offset: 1, color: 'rgba(44, 120, 108, 0.1)' }
        ])
      }
    }]
  }
  
  viewsChartInstance.setOption(option)
}

// 更新内容发布图表
const updateContentChart = (dates, values) => {
  if (!contentChartInstance) {
    contentChartInstance = echarts.init(document.querySelectorAll('.chart')[1])
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: values,
      type: 'bar',
      itemStyle: {
        color: '#2c786c'
      }
    }]
  }
  
  contentChartInstance.setOption(option)
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'danger'
    default: return ''
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '待审核'
    case 1: return '已通过'
    case 2: return '已驳回'
    default: return ''
  }
}

// 监听窗口 resize
const handleResize = () => {
  if (viewsChartInstance) {
    viewsChartInstance.resize()
  }
  if (contentChartInstance) {
    contentChartInstance.resize()
  }
}

// 生命周期钩子
onMounted(() => {
  getCoreStatistics()
  getHotScenicSpots()
  getHotGuides()
  loadChartData()
  loadContentChartData()
  
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
}

.stat-icon.scenic {
  background-color: #2c786c;
}

.stat-icon.guide {
  background-color: #3a9188;
}

.stat-icon.message {
  background-color: #48a69d;
}

.stat-icon.views {
  background-color: #56bdb4;
}

.stat-info h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 5px 0;
}

.stat-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 图表 */
.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  height: 300px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  width: 100%;
  height: calc(100% - 40px);
}

/* 热门内容 */
.hot-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
}

.hot-card {
  min-height: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts {
    grid-template-columns: 1fr;
  }
  
  .hot-content {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    height: 250px;
  }
}
</style>