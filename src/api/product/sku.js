// sku模块
import server from '@/utils/ajax'

export const reqSkuList = (page, limit) =>
  server({ url: `/admin/product/list/${page}/${limit}`, method: 'get' })

export const reqSale = (skuId) =>
  server({ url: `/admin/product/onSale/${skuId}`, method: 'get' })

export const reqCancel = (skuId) =>
  server({ url: `/admin/product/cancelSale/${skuId}`, method: 'get' })

export const reqSkuById = (skuId) =>
  server({ url: `/admin/product/getSkuById/${skuId}`, method: 'get' })
