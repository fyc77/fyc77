<template>
  <div class="scenic">
    <!-- 搜索和操作栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.keyword"
        placeholder="请输入景点名称"
        clearable
        style="width: 200px; margin-right: 10px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        v-model="searchForm.category_id"
        placeholder="选择分类"
        style="width: 150px; margin-right: 10px"
      >
        <el-option label="全部" value=""></el-option>
        <el-option
          v-for="category in categories"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        ></el-option>
      </el-select>
      <el-select
        v-model="searchForm.status"
        placeholder="选择状态"
        style="width: 120px; margin-right: 10px"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="上架" value="1"></el-option>
        <el-option label="下架" value="0"></el-option>
      </el-select>
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button type="success" @click="handleAdd" style="margin-left: 10px">新增景点</el-button>
    </div>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="scenicList"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="景点名称" width="180"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="category.name" label="分类" width="120"></el-table-column>
        <el-table-column prop="ticket_price" label="门票价格" width="100">
          <template #default="scope">
            {{ scope.row.ticket_price || '免费' }}
          </template>
        </el-table-column>
        <el-table-column prop="views" label="访问量" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
              style="margin-right: 5px"
            >
              编辑
            </el-button>
            <el-button
              :type="scope.row.status === 1 ? 'danger' : 'success'"
              size="small"
              @click="handleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pageInfo.page"
          v-model:page-size="pageInfo.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageInfo.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedRows.length > 0">
      <span>已选择 {{ selectedRows.length }} 项</span>
      <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
      <el-button type="success" @click="handleBatchOnline">批量上架</el-button>
      <el-button type="warning" @click="handleBatchOffline">批量下架</el-button>
    </div>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增景点' : '编辑景点'"
      width="600px"
    >
      <el-form
        ref="scenicForm"
        :model="scenicForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="景点名称" prop="name">
          <el-input v-model="scenicForm.name" placeholder="请输入景点名称"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="scenicForm.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="景点等级">
          <el-input v-model="scenicForm.level" placeholder="请输入景点等级"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="scenicForm.category_id" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="门票价格">
          <el-input v-model="scenicForm.ticket_price" type="number" placeholder="请输入门票价格"></el-input>
        </el-form-item>
        <el-form-item label="开放时间">
          <el-input v-model="scenicForm.opening_hours" placeholder="请输入开放时间"></el-input>
        </el-form-item>
        <el-form-item label="交通信息">
          <el-input
            v-model="scenicForm.traffic"
            type="textarea"
            placeholder="请输入交通信息"
            :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="scenicForm.contact" placeholder="请输入联系方式"></el-input>
        </el-form-item>
        <el-form-item label="图文详情">
          <el-input
            v-model="scenicForm.description"
            type="textarea"
            placeholder="请输入图文详情"
            :rows="5"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category_id: '',
  status: ''
})

// 分页信息
const pageInfo = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 景点列表
const scenicList = ref([])
// 选中的行
const selectedRows = ref([])
// 分类列表
const categories = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const scenicForm = reactive({})

// 表单规则
const rules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'blur' }]
}

// 获取分类列表
const getCategories = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/scenic/categories', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.data.code === 200) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取景点列表
const getScenicList = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/scenic/list', {
      params: {
        page: pageInfo.page,
        limit: pageInfo.limit,
        keyword: searchForm.keyword,
        category_id: searchForm.category_id,
        status: searchForm.status
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.data.code === 200) {
      scenicList.value = response.data.data.list
      pageInfo.total = response.data.data.total
    }
  } catch (error) {
    console.error('获取景点列表失败:', error)
  }
}

// 搜索
const search = () => {
  pageInfo.page = 1
  getScenicList()
}

// 分页
const handleSizeChange = (size) => {
  pageInfo.limit = size
  getScenicList()
}

const handleCurrentChange = (current) => {
  pageInfo.page = current
  getScenicList()
}

// 选择行
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(scenicForm, {
    name: '',
    address: '',
    level: '',
    category_id: '',
    ticket_price: '',
    opening_hours: '',
    traffic: '',
    contact: '',
    description: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(scenicForm, row)
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token')
    let response
    
    if (dialogType.value === 'add') {
      response = await axios.post('/api/scenic/create', scenicForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } else {
      response = await axios.put(`/api/scenic/update/${scenicForm.id}`, scenicForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    }
    
    if (response.data.code === 200 || response.data.code === 201) {
      ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
      dialogVisible.value = false
      getScenicList()
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败，请检查网络连接')
  }
}

// 状态切换
const handleStatus = async (row) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(`/api/scenic/status/${row.id}`, {
      status: row.status === 1 ? 0 : 1
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data.code === 200) {
      ElMessage.success(`景点已${row.status === 1 ? '下架' : '上架'}`)
      getScenicList()
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('操作失败，请检查网络连接')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    const token = localStorage.getItem('token')
    const ids = selectedRows.value.map(row => row.id)
    
    for (const id of ids) {
      await axios.delete(`/api/scenic/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    }
    
    ElMessage.success(`已删除 ${ids.length} 个景点`)
    selectedRows.value = []
    getScenicList()
  } catch (error) {
    console.error('批量删除失败:', error)
    ElMessage.error('操作失败，请检查网络连接')
  }
}

// 批量上架
const handleBatchOnline = async () => {
  try {
    const token = localStorage.getItem('token')
    const ids = selectedRows.value.map(row => row.id)
    
    for (const id of ids) {
      await axios.put(`/api/scenic/status/${id}`, {
        status: 1
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    }
    
    ElMessage.success(`已上架 ${ids.length} 个景点`)
    selectedRows.value = []
    getScenicList()
  } catch (error) {
    console.error('批量上架失败:', error)
    ElMessage.error('操作失败，请检查网络连接')
  }
}

// 批量下架
const handleBatchOffline = async () => {
  try {
    const token = localStorage.getItem('token')
    const ids = selectedRows.value.map(row => row.id)
    
    for (const id of ids) {
      await axios.put(`/api/scenic/status/${id}`, {
        status: 0
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    }
    
    ElMessage.success(`已下架 ${ids.length} 个景点`)
    selectedRows.value = []
    getScenicList()
  } catch (error) {
    console.error('批量下架失败:', error)
    ElMessage.error('操作失败，请检查网络连接')
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 生命周期钩子
onMounted(() => {
  getCategories()
  getScenicList()
})
</script>

<style scoped>
.scenic {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  overflow: hidden;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.batch-actions span {
  font-weight: bold;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar input,
  .search-bar select,
  .search-bar button {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
  
  .batch-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-actions button {
    width: 100%;
  }
}
</style>