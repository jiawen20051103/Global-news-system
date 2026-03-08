import axios from "axios";

// 统一管理后端基础地址
// 优先使用环境变量 VITE_API_BASE_URL（例如：https://your-domain.com/api 或 /api）
// 本地开发且未配置环境变量时，默认走 http://localhost:3001/api
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // 本地开发默认后端端口
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
  }

  // 部署到同源时，默认通过反向代理转发到 /api
  return '/api';
};

const request = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000
});

// 添加请求拦截器：自动携带 JWT
request.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default request;