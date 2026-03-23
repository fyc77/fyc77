<template>
  <div class="statistics-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>数据统计与分析</span>
          <el-button type="primary" @click="exportData">导出数据</el-button>
        </div>
      </template>
      
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
            />
          </el-col>
          <el-col :span="8">
            <el-select v-model="category" placeholder="选择分类" @change="handleCategoryChange">
              <el-option label="全部" value="all" />
              <el-option label="景点" value="scenic" />
              <el-option label="攻略" value="guide" />
              <el-option label="留言" value="message" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 核心统计卡片 -->
      <div class="stats-cards">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalScenic }}</div>
            <div class="stat-label">景点总数</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalGuide }}</div>
            <div class="stat-label">攻略总数</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalMessage }}</div>
            <div class="stat-label">留言总数</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalVisit }}</div>
            <div class="stat-label">总访问量</div>
          </div>
        </el-card>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-section">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>访问量趋势</span>
          </template>
          <div id="visitChart" class="chart"></div>
        </el-card>
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>内容分布</span>
          </template>
          <div id="contentChart" class="chart"></div>
        </el-card>
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>用户活跃度</span>
          </template>
          <div id="activityChart" class="chart"></div>
        </el-card>
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>互动率分析</span>
          </template>
          <div id="interactionChart" class="chart"></div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

// 状态管理
const dateRange = ref([])
const category = ref('all')

// 统计数据
const totalScenic = ref(0)
const totalGuide = ref(0)
const totalMessage = ref(0)
const totalVisit = ref(0)

// 图表实例
let visitChart = null
let contentChart = null
let activityChart = null
let interactionChart = null

// 获取统计数据
const getStatistics = async () => {
  try {
    const response = await axios.get('/api/statistics', {
      params: {
        startDate: dateRange.value[0] ? dateRange.value[0].toISOString() : '',
        endDate: dateRange.value[1] ? dateRange.value[1].toISOString() : '',
        category: category.value
      }
    })
    const data = response.data.data
    
    // 更新统计卡片数据
    totalScenic.value = data.totalScenic
    totalGuide.value = data.totalGuide
    totalMessage.value = data.totalMessage
    totalVisit.value = data.totalVisit
    
    // 更新图表
    updateVisitChart(data.visitTrend)
    updateContentChart(data.contentDistribution)
    updateActivityChart(data.userActivity)
    updateInteractionChart(data.interactionRate)
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  }
}

// 初始化图表
const initCharts = () => {
  // 访问量趋势图
  visitChart = echarts.init(document.getElementById('visitChart'))
  // 内容分布图
  contentChart = echarts.init(document.getElementById('contentChart'))
  // 用户活跃度图
  activityChart = echarts.init(document.getElementById('activityChart'))
  // 互动率分析图
  interactionChart = echarts.init(document.getElementById('interactionChart'))
}

// 更新访问量趋势图
const updateVisitChart = (data) => {
  if (!visitChart) return
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['访问量']
    },
    xAxis: {
      type: 'category',
      data: data.labels
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        data: data.values,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  visitChart.setOption(option)
}

// 更新内容分布图
const updateContentChart = (data) => {
  if (!contentChart) return
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '内容分布',
        type: 'pie',
        radius: '60%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  contentChart.setOption(option)
}

// 更新用户活跃度图
const updateActivityChart = (data) => {
  if (!activityChart) return
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['活跃用户数']
    },
    xAxis: {
      type: 'category',
      data: data.labels
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '活跃用户数',
        type: 'bar',
        data: data.values,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
  
  activityChart.setOption(option)
}

// 更新互动率分析图
const updateInteractionChart = (data) => {
  if (!interactionChart) return
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['点赞数', '评论数']
    },
    xAxis: {
      type: 'category',
      data: data.labels
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '点赞数',
        type: 'bar',
        data: data.likeValues,
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: '评论数',
        type: 'bar',
        data: data.commentValues,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  
  interactionChart.setOption(option)
}

// 处理日期变化
const handleDateChange = () => {
  getStatistics()
}

// 处理分类变化
const handleCategoryChange = () => {
  getStatistics()
}

// 刷新数据
const refreshData = () => {
  getStatistics()
}

// 导出数据
const exportData = async () => {
  try {
    const response = await axios.get('/api/statistics/export', {
      params: {
        startDate: dateRange.value[0] ? dateRange.value[0].toISOString() : '',
        endDate: dateRange.value[1] ? dateRange.value[1].toISOString() : '',
        category: category.value
      },
      responseType: 'blob'
    })
    
    // 创建下载链接
    const url = URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `statistics_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('数据导出失败')
  }
}

// 响应式处理
const handleResize = () => {
  visitChart?.resize()
  contentChart?.resize()
  activityChart?.resize()
  interactionChart?.resize()
}

// 初始化
onMounted(() => {
  initCharts()
  getStatistics()
  window.addEventListener('resize', handleResize)
})

// 清理
onUnmounted(() => {
  visitChart?.dispose()
  contentChart?.dispose()
  activityChart?.dispose()
  interactionChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin: 20px 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  text-align: center;
}

.stat-item {
  padding: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.chart-card {
  min-height: 300px;
}

.chart {
  width: 100%;
  height: 300px;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .chart {
    height: 250px;
  }
}
</style>