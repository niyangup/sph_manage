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
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="update(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelItem(row)">删除</el-button>
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

    <el-dialog :title="tmForm.id ?'修改品牌':'添加品牌'" :visible.sync="dialogFormVisible">
      <el-form ref="rulerForm" :model="tmForm" style="width: 80%" :rules="rules">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="品牌logo" label-width="100px" prop="logoUrl">

          <el-upload
            class="avatar-uploader"
            action="/api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Api from '@/api/api'
import { reqDeleteTradeMark } from '@/api/product/tradeMark'

export default {
  name: 'TradeMark',
  data() {
    return {
      page: 1,
      limit: 3,
      total: 0,
      list: [],
      dialogFormVisible: false,
      tmForm: {
        tmName: '',
        logoUrl: ''
      },
      rules: {
        tmName: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在2-10个字符', trigger: 'change' }
        ],
        logoUrl: [{ required: true, message: '请选择品牌的图片' }]
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
      this.tmForm.tmName = ''
      this.tmForm.logoUrl = ''
    },
    update(row) {
      console.log(row)
      this.showDialog()
      this.tmForm = { ...row }
    },
    handleAvatarSuccess(res, file) {
      this.tmForm.logoUrl = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    handleAddTradeMark() {
      this.$refs.rulerForm.validate(async(result) => {
        if (result === true) {
          this.dialogFormVisible = false
          const response = await Api.trademark.reqAddOrUpdateTradeMark(this.tmForm)
          if (response.code === 200) {
            this.$message({
              message: this.tmForm.id ? '修改成功' : '添加成功',
              type: 'success'
            })
            await this.getData()
          }
        } else {
          console.log('表单验证失败')
        }
      })
    },
    async handleDelItem(item) {
      console.log(item)

      try {
        await this.$confirm(`确定要删除${item.tmName}吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        try {
          await reqDeleteTradeMark(item.id)
          await this.getData()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        } catch (e) {
          console.log(e
          )
        }
      } catch (e) {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
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

  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}

</style>
