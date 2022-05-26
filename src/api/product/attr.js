import server from '@/utils/ajax'

export const reqCategory1List = () =>
  server({ url: '/admin/product/getCategory1', method: 'get' })

export const reqCategory2List = (category1Id) =>
  server({
    url: `/admin/product/getCategory2/${category1Id}`,
    method: 'get'
  })

export const reqCategory3List = (category2Id) =>
  server({
    url: `/admin/product/getCategory3/${category2Id}`,
    method: 'get'
  })

export const reqAttrList = (category1Id, category2Id, category3Id) =>
  server({
    url: `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
    method: 'get'
  })

export const reqAddOrUpdateAttr = (data) =>
  server({ url: '/admin/product/saveAttrInfo', method: 'post', data })
