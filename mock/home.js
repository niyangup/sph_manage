const Mock = require('mockjs')

const data = require('./data.json')
module.exports = [
  {
    url: '/home/list',
    type: 'get',
    response: (config) => {
      const items = data.items
      return {
        code: 20000,
        data
      }
    }
  }
]

Mock.mock(process.env.VUE_APP_MOCK_API + '/home/list', 'get', {
  code: 20000,
  data
})
