<template>
  <div class="trade-mark-container">
    <el-button
      type="primary"
      icon="el-icon-plus"
      class="btn-add"
      @click="showDialog"
    >
      添加
    </el-button>
    <el-table
      :data="list"
      style="width: 100%"
      border
    >
      <el-table-column
        type="index"
        prop="date"
        label="序号"
        width="80"
        align="center"
      />
      <el-table-column
        prop="tmName"
        label="品牌名称"
      />
      <el-table-column prop="logoUrl" label="品牌LOGO">
        <template v-slot="{row}">
          <img :src="row.logoUrl" alt="" style="width: 100px;height: 100px">
        </template>
      </el-table-column>
      <el-table-column
        prop="address"
        label="操作"
      >
        <template v-slot="{row,$index}">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="update">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes, total"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <el-form :model="form" style="width: 80%">
        <el-form-item label="品牌名称" label-width="100px">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="品牌logo" label-width="100px">
          <el-input v-model="form.logo" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Api from '@/api/api'

export default {
  name: 'TradeMark',
  data() {
    return {
      page: 1,
      limit: 3,
      total: 0,
      list: [],
      dialogFormVisible: true,
      form: {
        name: '',
        logo: ''
      }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      const response = await Api.trademark.reqTradeMarkList(this.page, this.limit)
      this.total = response.data.total
      this.list = response.data.records
    },
    handleCurrentChange(selectIndex) {
      if (selectIndex !== this.page) {
        this.page = selectIndex
        this.getData()
      }
    },
    handleSizeChange(size) {
      if (this.limit !== size) {
        this.limit = size
        this.getData()
      }
    },
    showDialog() {
      this.dialogFormVisible = !this.dialogFormVisible
    },
    update() {
      this.showDialog()
    }
  }
}
</script>

<style scoped lang="scss">
.trade-mark-container {
  .btn-add {
    margin: 10px 0;
  }

  .pagination {
    margin-top: 20px;
    text-align: center;
  }
}

</style>
