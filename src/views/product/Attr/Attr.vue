<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelect :show="!isShowTable" @getCategoryId="getCategoryId" />
    </el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addAttr"
        >添加属性
        </el-button>
        <!-- 表格:展示平台属性 -->
        <el-table style="width: 100%" border :data="attrList">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="attrName" label="属性名称" width="150" />
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template v-slot="{ row }">
              <el-tag
                v-for="(attrValue) in row.attrValueList"
                :key="attrValue.id"
                type="success"
                style="margin: 0 20px"
              >{{ attrValue.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template v-slot="{ row }">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="updateAttr(row)"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowTable">
        <el-form ref="form" :inline="true" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input
              v-model="attrInfo.attrName"
              placeholder="请输入属性名"
            />
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrInfo.attrName"
          @click="addAttrValue"
        >添加属性值
        </el-button>
        <el-button @click="isShowTable = true">取消</el-button>
        <el-table
          style="width: 100%; margin: 20px 0"
          border
          :data="attrInfo.attrValueList"
        >
          <el-table-column align="center" type="index" label="序号" width="80" />
          <el-table-column width="width" prop="prop" label="属性值名称">
            <template v-slot="{ row, $index }">
              <!-- 这里结构需要用到span与input进行来回的切换 -->
              <el-input
                v-if="row.flag"
                :ref="$index"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
                @blur="toLook(row)"
                @keyup.native.enter="toLook(row)"
              />
              <span
                v-else
                style="display: block"
                @click="toEdit(row, $index)"
              >{{ row.valueName }}</span>
            </template>
          </el-table-column>
          <el-table-column width="width" prop="prop" label="操作">
            <template v-slot="{ row, $index }">
              <!-- 气泡确认框 -->
              <el-popconfirm :title="`确定删除${row.valueName}?`" @onConfirm="deleteAttrValue($index)">
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                />
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" :disabled="attrInfo.attrValueList.length<1" @click="addOrUpdateAttr">保存</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import Api from '@/api/api'

export default {
  name: 'Attr',
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      attrList: [],
      isShowTable: true,
      attrInfo: {
        attrName: '',
        attrValueList: [],
        categoryId: 0,
        categoryLevel: 3
      }
    }
  },
  methods: {
    // 自定义事件的回调
    getCategoryId({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId
        this.category2Id = ''
        this.category3Id = ''
      } else if (level === 2) {
        this.category2Id = categoryId
        this.category3Id = ''
      } else {
        this.category3Id = categoryId
        this.getAttrList()
      }
    },
    // 获取平台属性的数据
    // 当用户确定三级分类的数据时候，可以向服务器发请求获取平台属性进行展示
    async getAttrList() {
      // 获取分类的ID
      const { category1Id, category2Id, category3Id } = this
      // 获取属性列表的数据
      const result = await Api.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      )
      if (result.code === 200) {
        this.attrList = result.data
      }
    },
    // 添加属性值回调
    addAttrValue() {
      // 向属性值的数组里面添加元素
      // attrId：是你相应的属性的id，目前而言我们是添加属性的操作，还没有相应的属性的id，目前而言带给服务器的id为undefined
      // valueName:相应的属性值的名称
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id, // 对于修改某一个属性的时候，可以在已有的属性值基础之上新增新的属性值（新增属性值的时候，需要把已有的属性的id带上）
        valueName: '',
        flag: true
      })
      // flag属性：给每一个属性值添加一个标记flag，用户切换查看模式与编辑模式，好处，每一个属性值可以控制自己的模式切换
      // 当前flag属性，响应式数据（数据变化视图跟着变化）
      this.$nextTick(() => {
        this.$refs[this.attrInfo.attrValueList.length - 1].focus()
      })
    },
    // 添加属性按钮的回调
    addAttr() {
      // 切换table显示与隐藏
      this.isShowTable = false
      // 清除数据
      // 收集三级分类的id
      this.attrInfo = {
        attrName: '',
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3
      }
    },
    // 修改某一个属性
    updateAttr(row) {
      this.isShowTable = false
      this.attrInfo = cloneDeep(row)
      this.attrInfo.attrValueList.forEach((item) => {
        this.$set(item, 'flag', false)
      })
    },
    toLook(row) {
      if (row.valueName.trim() === '') {
        this.$message('请你输入一个正常的属性值')
        return
      }
      const isRepeat = this.attrInfo.attrValueList.some(item => {
        if (row !== item) {
          return row.valueName === item.valueName
        }
      })

      if (isRepeat) return
      row.flag = false
    },
    toEdit(row, index) {
      row.flag = true
      this.$nextTick(() => {
        // 获取相应的input表单元素实现聚焦
        this.$refs[index].focus()
      })
    },
    deleteAttrValue(index) {
      this.attrInfo.attrValueList.splice(index, 1)
    },
    async addOrUpdateAttr() {
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(item => {
        if (item.valueName !== '') {
          delete item.flag
          return true
        }
      })
      try {
        // 发请求
        await Api.attr.reqAddOrUpdateAttr(this.attrInfo)
        this.isShowTable = true
        this.$message({ type: 'success', message: '保存成功' })
        await this.getAttrList()
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style scoped>
</style>
