import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: 'https://wuhunyu.top/code-gen-api',
  timeout: 3000 // 请求超时时间
})

// http request 拦截器
service.interceptors.request.use(
  config => {
    return config;
  },
  err => {
    return Promise.reject(err);
  })
// http response 拦截器
service.interceptors.response.use(
  response => {
    if (response.data.code === 500) {
      return Promise.reject(response.data.message)
    }
    return response.data;
  },
  error => {
    return Promise.reject(error.response)   // 返回接口返回的错误信息
  });

export default service
