<template>
  <div class="travel-guide-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>旅游攻略管理</span>
          <el-button type="primary" @click="handleAdd" icon="Plus">新增攻略</el-button>
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
            <el-select v-model="searchForm.scenicId" placeholder="选择关联景点" clearable>
              <el-option
                v-for="scenic in scenicList"
                :key="scenic.id"
                :label="scenic.name"
                :value="scenic.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
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
        <el-button @click="batchApprove">批量通过</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </div>
      
      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="guideList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column label="关联景点" width="180">
          <template #default="scope">
            {{ getScenicName(scope.row.scenicId) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'approved' ? 'success' : scope.row.status === 'rejected' ? 'danger' : 'warning'"
            >
              {{ scope.row.status === 'approved' ? '已通过' : scope.row.status === 'rejected' ? '已驳回' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="阅读量" width="100" />
        <el-table-column prop="likeCount" label="点赞数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="primary" @click="handleApprove(scope.row)" v-if="scope.row.status === 'pending'">通过</el-button>
            <el-button size="small" type="danger" @click="handleReject(scope.row)" v-if="scope.row.status === 'pending'">驳回</el-button>
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
    
    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增旅游攻略' : '编辑旅游攻略'"
      width="80%"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="关联景点" prop="scenicId">
          <el-select v-model="form.scenicId" placeholder="请选择关联景点">
            <el-option
              v-for="scenic in scenicList"
              :key="scenic.id"
              :label="scenic.name"
              :value="scenic.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="请输入标签，用逗号分隔" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="行程" prop="itinerary">
          <el-input
            v-model="form.itinerary"
            type="textarea"
            :rows="3"
            placeholder="请输入行程安排"
          />
        </el-form-item>
        <el-form-item label="图文详情" prop="content">
          <div class="editor-container">
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleImageUpload"
              :before-upload="beforeUpload"
            >
              <el-button size="small" type="primary">上传图片</el-button>
            </el-upload>
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="10"
              placeholder="请输入图文详情"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 驳回对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="驳回攻略"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回原因">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  scenicId: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const form = reactive({
  id: '',
  title: '',
  author: '',
  scenicId: '',
  tags: '',
  status: 'pending',
  itinerary: '',
  content: ''
})

// 驳回表单
const rejectForm = reactive({
  reason: '',
  guideId: ''
})

// 验证规则
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  scenicId: [{ required: true, message: '请选择关联景点', trigger: 'change' }],
  content: [{ required: true, message: '请输入图文详情', trigger: 'blur' }]
}

// 数据
const guideList = ref([])
const scenicList = ref([])

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
  loading.value = true
  try {
    const response = await axios.get('/api/travel-guides', {
      params: {
        keyword: searchForm.keyword,
        scenicId: searchForm.scenicId,
        status: searchForm.status,
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      }
    })
    guideList.value = response.data.data
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('获取攻略列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  getGuideList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.scenicId = ''
  searchForm.status = ''
  pagination.currentPage = 1
  getGuideList()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  getGuideList()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  getGuideList()
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

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    id: '',
    title: '',
    author: '',
    scenicId: '',
    tags: '',
    status: 'pending',
    itinerary: '',
    content: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await axios.post('/api/travel-guides', form)
          ElMessage.success('新增成功')
        } else {
          await axios.put(`/api/travel-guides/${form.id}`, form)
          ElMessage.success('编辑成功')
        }
        dialogVisible.value = false
        getGuideList()
      } catch (error) {
        ElMessage.error(dialogType.value === 'add' ? '新增失败' : '编辑失败')
      }
    }
  })
}

// 删除
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条攻略吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await axios.delete(`/api/travel-guides/${id}`)
    ElMessage.success('删除成功')
    getGuideList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的攻略')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除选中的攻略吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const ids = selectedRows.value.map(row => row.id)
    await axios.delete('/api/travel-guides/batch', {
      data: { ids }
    })
    ElMessage.success('批量删除成功')
    getGuideList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 审核通过
const handleApprove = async (row) => {
  try {
    await axios.put(`/api/travel-guides/${row.id}/approve`)
    ElMessage.success('审核通过')
    getGuideList()
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

// 批量通过
const batchApprove = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审核的攻略')
    return
  }
  try {
    const ids = selectedRows.value.map(row => row.id)
    await axios.put('/api/travel-guides/batch/approve', { ids })
    ElMessage.success('批量审核通过')
    getGuideList()
  } catch (error) {
    ElMessage.error('批量审核失败')
  }
}

// 驳回
const handleReject = (row) => {
  rejectForm.guideId = row.id
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认驳回
const confirmReject = async () => {
  if (!rejectForm.reason) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  try {
    await axios.put(`/api/travel-guides/${rejectForm.guideId}/reject`, {
      reason: rejectForm.reason
    })
    ElMessage.success('驳回成功')
    rejectDialogVisible.value = false
    getGuideList()
  } catch (error) {
    ElMessage.error('驳回失败')
  }
}

// 图片上传
const handleImageUpload = (response) => {
  if (response.code === 200) {
    form.content += `<img src="${response.data.url}" alt="图片" style="max-width: 100%;">`
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG/PNG 图片')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
  }
  return isJpgOrPng && isLt2M
}

// 初始化
onMounted(() => {
  getScenicList()
  getGuideList()
})
</script>

<style scoped>
.travel-guide-container {
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

.editor-container {
  margin-bottom: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>