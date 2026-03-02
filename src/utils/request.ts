// src/utils/request.ts
import axios from 'axios';
import { message } from 'antd';

// 1. 创建 Axios 实例
const request = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000, // 请求超时时间 (10秒)
});

// 2. 请求拦截器 (Request Interceptor)
request.interceptors.request.use(
  (config) => {
    // 💡 每次发请求前，从 localStorage 拿出 Token 塞进请求头里
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器 (Response Interceptor)
request.interceptors.response.use(
  (response) => {
    // 💡 只要 HTTP 状态码是 2xx，就会进入这里
    // 大厂通常会在这里剥离最外层的 code/msg 结构，直接返回 data
    return response.data;
  },
  (error) => {
    // 💡 HTTP 状态码是非 2xx，会进入这里统一处理错误
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录！');
          // 这里可以执行登出操作，跳转回登录页
          // window.location.href = '/login'; 
          break;
        case 403:
          message.error('您没有权限访问该资源！');
          break;
        case 404:
          message.error('请求的接口不存在！');
          break;
        case 500:
          message.error('服务器开小差了，请稍后再试！');
          break;
        default:
          message.error(`网络错误: ${error.message}`);
      }
    } else {
      message.error('网络连接失败，请检查您的网络！');
    }
    return Promise.reject(error);
  }
);

export default request;