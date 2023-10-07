import request from '@/utils/request'

// 代码生成
export function codeGen(ddlSql) {
  return request({
    url: `/code-gen`,
    method: 'post',
    data: ddlSql
  })
}

// 获取可使用的模板名称列表
export function listTemplateNames() {
  return request({
    url: `/code-gen/template-names`,
    method: 'get'
  })
}
