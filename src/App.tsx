// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthGuard from './components/AuthGuard';
import MainLayout from './layouts/MainLayout';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import Settings from './pages/Settings';
import Assignment from './pages/Assignment';
import Report from './/pages/Report';
import DictionaryAdmin from "./components/DictionaryAdmin";
import CreateClass from './pages/CreateClass';

export default function App() {

  const [isMobile, setIsMobile] = useState(false);

  // 监听屏幕宽度
  useEffect(() => {
    const checkDevice = () => {
      // 大厂标准：宽度小于 768px 通常被认定为移动设备
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice(); // 初始检查
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 🚨 终极拦截逻辑
  if (isMobile) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', height: '100vh', backgroundColor: '#f6f8fa', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ color: '#333', marginBottom: '16px' }}>📱 移动端适配中...</h2>
        <p style={{ color: '#666', lineHeight: '1.6' }}>
          尊敬的面试官您好：<br/><br/>
          “Word Killer Admin” 包含复杂的数据分析大盘与高交互长列表，为保证完美的 O(1) 渲染体验，<strong style={{color:'#d93025'}}>请您使用 PC 端浏览器访问本站。</strong><br/><br/>
          感谢您的查阅！
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 当路径是 / 时，渲染登录页 */}
        <Route path="/" element={<Login />} />
        
        {/* 当路径是 /dashboard 时，渲染主页 */}
        <Route 
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          {/* 下面这些组件，都会被塞进 MainLayout 的 <Outlet /> 里面！ */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classes/create" element={<CreateClass />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/assignments" element={<Assignment />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dictionary" element={<DictionaryAdmin />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


