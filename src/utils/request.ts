// src/utils/request.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { message } from 'antd';

// 扩展 Axios 类型：让 request.get/post 直接返回解包后的数据而非 AxiosResponse
interface DataAxiosInstance extends AxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export interface BaseRes<T>{
    code:number;
    msg:string;
    data:T
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// 1. 创建 Axios 实例
const request = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000, // 请求超时时间 (10秒)
}) as DataAxiosInstance;

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
  (response: AxiosResponse) => {
    const res = response.data;

    if (res.code && res.code !==200){
      message.error(res.msg || '操作失败')

      if(res.code === 401){
        localStorage.removeItem('token');
        const currentPath = window.location.pathname;

        if (currentPath !== '/') {
            window.location.href = '/'; 
        }
      }

      return Promise.reject(new Error(res.msg || 'Error'));

    }


    return res;
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
