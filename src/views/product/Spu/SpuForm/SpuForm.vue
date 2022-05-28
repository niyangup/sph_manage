<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spu">
      <el-form-item label="SPU名称">
        <el-input v-model="spu.spuName" placeholder="SPU名称" />
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spu.tmId" placeholder="请选择品牌">
          <el-option
            v-for="(tm) in tradeMarkList"
            :key="tm.id"
            :label="tm.tmName"
            :value="tm.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          v-model="spu.description"
          type="textarea"
          rows="4"
          placeholder="描述"
        />
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handlerSuccess"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus" />
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          v-model="attrIdAndAttrName"
          :placeholder="`还有${unSelectSaleAttr.length}未选择`"
        >
          <el-option
            v-for="(unselect) in unSelectSaleAttr"
            :key="unselect.id"
            :label="unselect.name"
            :value="`${unselect.id}:${unselect.name}`"
          />
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrIdAndAttrName"
          @click="addSaleAttr"
        >添加销售属性
        </el-button>
        <!-- 展示的是当前SPU属于自己的销售属性 -->
        <el-table style="width: 100%" border :data="spu.spuSaleAttrList">
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          />
          <el-table-column prop="saleAttrName" label="属性名" width="width" />
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template v-slot="{ row }">
              <el-tag
                v-for="(tag,index) in row.spuSaleAttrValueList"
                :key="tag.id"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >{{ tag.saleAttrValueName }}
              </el-tag>
              <el-input
                v-if="row.inputVisible"
                ref="saveTagInput"
                v-model="row.inputValue"
                class="input-new-tag"
                size="small"
                @blur="handleInputConfirm(row)"
              />
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="addSaleAttrValue(row)"
              >添加
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template v-slot="{ row, $index }">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="spu.spuSaleAttrList.splice($index, 1)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Api from '@/api/api'

export default {
  name: 'SpuForm',
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,

      spu: {
        // 三级分类的id
        category3Id: 0,
        // 描述
        description: '',
        // spu名称
        spuName: '',
        // 平台的id
        tmId: '',
        // 收集SPU图片的信息
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        // 平台属性与属性值收集
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          //     {
          //       baseSaleAttrId: 0,
          //       id: 0,
          //       isChecked: "string",
          //       saleAttrName: "string",
          //       saleAttrValueName: "string",
          //       spuId: 0,
          //     },
          //   ],
          // },
        ]
      },
      tradeMarkList: [], // 存储品牌信息
      spuImageList: [], // 存储SPU图片的数据
      saleAttrList: [], // 销售属性的数据（项目全部的销售属性）
      attrIdAndAttrName: '' // 收集未选择的销售属性的id-----
    }
  },
  computed: {
    unSelectSaleAttr() {
      return this.saleAttrList.filter((item) => {
        // every数组的方法，会返回一个布尔值【真，假的】
        return this.spu.spuSaleAttrList.every((item1) => {
          return item.name !== item1.saleAttrName
        })
      })
    }
  },
  methods: {
    handleRemove(file, fileList) {
      this.spuImageList = fileList
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    async initSpuData(spu) {
      const spuResult = await Api.spu.reqSpu(spu.id)
      if (spuResult.code === 200) {
        this.spu = spuResult.data
      }
      const tradeMarkResult = await Api.spu.reqTradeMarkList()
      if (tradeMarkResult.code === 200) {
        this.tradeMarkList = tradeMarkResult.data
      }
      const spuImageResult = await Api.spu.reqSpuImageList(spu.id)
      if (spuImageResult.code === 200) {
        const listArr = spuImageResult.data
        listArr.forEach((item) => {
          item.name = item.imgName
          item.url = item.imgUrl
        })
        this.spuImageList = listArr
      }
      const saleResult = await Api.spu.reqBaseSaleAttrList()
      if (saleResult.code === 200) {
        this.saleAttrList = saleResult.data
      }
    },
    handlerSuccess(response, file, fileList) {
      this.spuImageList = fileList
    },
    addSaleAttr() {
      const [baseSaleAttrId, saleAttrName] = this.attrIdAndAttrName.split(':')
      const newSaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      }
      this.spu.spuSaleAttrList.push(newSaleAttr)
      this.attrIdAndAttrName = ''
    },
    addSaleAttrValue(row) {
      this.$set(row, 'inputVisible', true)
      this.$set(row, 'inputValue', '')
    },
    handleInputConfirm(row) {
      const { baseSaleAttrId, inputValue } = row
      if (inputValue.trim() === '') {
        this.$message('属性值不能为空')
        return
      }
      const result = row.spuSaleAttrValueList.every(
        (item) => item.saleAttrValueName !== inputValue
      )
      if (!result) return
      const newSaleAttrValue = { baseSaleAttrId, saleAttrValueName: inputValue }
      row.spuSaleAttrValueList.push(newSaleAttrValue)
      row.inputVisible = false
    },
    async addOrUpdateSpu() {
      this.spu.spuImageList = this.spuImageList.map((item) => {
        return {
          imageName: item.name,
          imageUrl: (item.response && item.response.data) || item.url
        }
      })
      const result = await Api.spu.reqAddOrUpdateSpu(this.spu)
      if (result.code === 200) {
        this.$message({ type: 'success', message: '保存成功' })
        this.$emit('changeScene', {
          scene: 0,
          flag: this.spu.id ? '修改' : '添加'
        })
      }
      Object.assign(this._data, this.$options.data())
    },
    async addSpuData(category3Id) {
      this.spu.category3Id = category3Id
      const tradeMarkResult = await Api.spu.reqTradeMarkList()
      if (tradeMarkResult.code === 200) {
        this.tradeMarkList = tradeMarkResult.data
      }
      const saleResult = await Api.spu.reqBaseSaleAttrList()
      if (saleResult.code === 200) {
        this.saleAttrList = saleResult.data
      }
    },
    cancel() {
      this.$emit('changeScene', { scene: 0, flag: '' })
      Object.assign(this._data, this.$options.data())
    }
  }
}
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
