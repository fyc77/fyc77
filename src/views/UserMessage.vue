<template>
  <div class="user-message-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户留言管理</span>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchForm.keyword"
              placeholder="输入关键词搜索"
              clearable
              prefix-icon="Search"
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchForm.scenicId" placeholder="选择景点" clearable>
              <el-option
                v-for="scenic in scenicList"
                :key="scenic.id"
                :label="scenic.name"
                :value="scenic.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchForm.guideId" placeholder="选择攻略" clearable>
              <el-option
                v-for="guide in guideList"
                :key="guide.id"
                :label="guide.title"
                :value="guide.id"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 批量操作 -->
      <div class="batch-operations" v-if="selectedRows.length > 0">
        <el-button @click="batchDelete">批量删除</el-button>
        <el-button @click="batchHide">批量隐藏</el-button>
        <el-button @click="batchShow">批量显示</el-button>
      </div>
      
      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="messageList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="content" label="留言内容" min-width="300">
          <template #default="scope">
            <span :class="{ 'hidden-content': scope.row.isHidden }">
              {{ scope.row.content }}
            </span>
            <el-tag v-if="scope.row.isHidden" size="small" type="info" effect="plain">已隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联内容" width="200">
          <template #default="scope">
            <div v-if="scope.row.scenicId">
              <el-link type="primary" @click="viewScenic(scope.row.scenicId)">
                {{ getScenicName(scope.row.scenicId) }}
              </el-link>
            </div>
            <div v-else-if="scope.row.guideId">
              <el-link type="primary" @click="viewGuide(scope.row.guideId)">
                {{ getGuideTitle(scope.row.guideId) }}
              </el-link>
            </div>
            <div v-else>
              无关联
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="留言时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleReply(scope.row)">回复</el-button>
            <el-button size="small" @click="handleHide(scope.row)" v-if="!scope.row.isHidden">隐藏</el-button>
            <el-button size="small" type="primary" @click="handleShow(scope.row)" v-else>显示</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      :title="`回复留言 - ${replyForm.username}`"
      width="600px"
    >
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="原留言">
          <el-input
            v-model="replyForm.originalContent"
            type="textarea"
            :rows="3"
            readonly
          />
        </el-form-item>
        <el-form-item label="回复内容" prop="replyContent">
          <el-input
            v-model="replyForm.replyContent"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReply">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const replyDialogVisible = ref(false)
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  scenicId: '',
  guideId: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 回复表单
const replyForm = reactive({
  id: '',
  username: '',
  originalContent: '',
  replyContent: ''
})

// 数据
const messageList = ref([])
const scenicList = ref([])
const guideList = ref([])

// 获取景点列表
const getScenicList = async () => {
  try {
    const response = await axios.get('/api/scenic-spots')
    scenicList.value = response.data.data
  } catch (error) {
    ElMessage.error('获取景点列表失败')
  }
}

// 获取攻略列表
const getGuideList = async () => {
  try {
    const response = await axios.get('/api/travel-guides')
    guideList.value = response.data.data
  } catch (error) {
    ElMessage.error('获取攻略列表失败')
  }
}

// 获取留言列表
const getMessageList = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/user-messages', {
      params: {
        keyword: searchForm.keyword,
        scenicId: searchForm.scenicId,
        guideId: searchForm.guideId,
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      }
    })
    messageList.value = response.data.data
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('获取留言列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  getMessageList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.scenicId = ''
  searchForm.guideId = ''
  pagination.currentPage = 1
  getMessageList()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  getMessageList()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  getMessageList()
}

// 选择处理
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 获取景点名称
const getScenicName = (scenicId) => {
  const scenic = scenicList.value.find(s => s.id === scenicId)
  return scenic ? scenic.name : ''
}

// 获取攻略标题
const getGuideTitle = (guideId) => {
  const guide = guideList.value.find(g => g.id === guideId)
  return guide ? guide.title : ''
}

// 查看景点
const viewScenic = (scenicId) => {
  // 可以跳转到景点详情页或打开详情对话框
  ElMessage.info(`查看景点 ID: ${scenicId}`)
}

// 查看攻略
const viewGuide = (guideId) => {
  // 可以跳转到攻略详情页或打开详情对话框
  ElMessage.info(`查看攻略 ID: ${guideId}`)
}

// 回复
const handleReply = (row) => {
  replyForm.id = row.id
  replyForm.username = row.username
  replyForm.originalContent = row.content
  replyForm.replyContent = ''
  replyDialogVisible.value = true
}

// 确认回复
const confirmReply = async () => {
  if (!replyForm.replyContent) {
    ElMessage.warning('请输入回复内容')
    return
  }
  try {
    await axios.post(`/api/user-messages/${replyForm.id}/reply`, {
      replyContent: replyForm.replyContent
    })
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    getMessageList()
  } catch (error) {
    ElMessage.error('回复失败')
  }
}

// 隐藏
const handleHide = async (row) => {
  try {
    await axios.put(`/api/user-messages/${row.id}/hide`)
    ElMessage.success('隐藏成功')
    getMessageList()
  } catch (error) {
    ElMessage.error('隐藏失败')
  }
}

// 显示
const handleShow = async (row) => {
  try {
    await axios.put(`/api/user-messages/${row.id}/show`)
    ElMessage.success('显示成功')
    getMessageList()
  } catch (error) {
    ElMessage.error('显示失败')
  }
}

// 删除
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条留言吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await axios.delete(`/api/user-messages/${id}`)
    ElMessage.success('删除成功')
    getMessageList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的留言')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除选中的留言吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const ids = selectedRows.value.map(row => row.id)
    await axios.delete('/api/user-messages/batch', {
      data: { ids }
    })
    ElMessage.success('批量删除成功')
    getMessageList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 批量隐藏
const batchHide = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要隐藏的留言')
    return
  }
  try {
    const ids = selectedRows.value.map(row => row.id)
    await axios.put('/api/user-messages/batch/hide', { ids })
    ElMessage.success('批量隐藏成功')
    getMessageList()
  } catch (error) {
    ElMessage.error('批量隐藏失败')
  }
}

// 批量显示
const batchShow = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要显示的留言')
    return
  }
  try {
    const ids = selectedRows.value.map(row => row.id)
    await axios.put('/api/user-messages/batch/show', { ids })
    ElMessage.success('批量显示成功')
    getMessageList()
  } catch (error) {
    ElMessage.error('批量显示失败')
  }
}

// 初始化
onMounted(() => {
  getScenicList()
  getGuideList()
  getMessageList()
})
</script>

<style scoped>
.user-message-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  margin: 20px 0;
}

.batch-operations {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.hidden-content {
  text-decoration: line-through;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>