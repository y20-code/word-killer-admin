import axios from 'axios';
import {message} from 'antd';

const api = axios.create({
    baseURL:'http://localhost:8080',
    timeout:5000,
})

api.interceptors.request.use(
    (config) =>{
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }

)

api.interceptors.response.use(
    (response) =>{
        return response.data
    },
    (error)=>{
        // 统一处理错误
        if (error.code === 'ERR_NETWORK') {
            message.error('网络连接失败，请检查后端服务是否启动！');
        } else if (error.response) {
            // 后端有返回，但状态码不是 2xx (比如 404, 500)
            message.error(`请求错误: ${error.response.status}`);
        } else {
            message.error('发生了未知错误');
        }
        return Promise.reject(error);
    }
);

export default api;