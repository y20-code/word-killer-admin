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
  // 定义你的核心技术栈数据
  const techStack = [
    { category: '前端内核', tags: ['React 18', 'TypeScript', 'Vite', 'Zustand'] },
    { category: 'UI & 工程化', tags: ['Ant Design', 'Docker', 'GitHub Actions'] },
    { category: '后端/全栈', tags: ['Java (Spring Boot)'] },
    { category: '业务领域', tags: ['数据平台开发', '低代码引擎',] }
  ];

  return (
    <div style={{ padding: '30px 20px', backgroundColor: '#f6f8fa', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#1a1a1a', fontSize: '22px' }}>杨林森 | 前端开发工程师</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>2026届秋招预备 · 数据平台方向</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {techStack.map((item, index) => (
          <div key={index} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', color: '#007bff', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              {item.category}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {item.tags.map(tag => (
                <span key={tag} style={{ padding: '4px 10px', backgroundColor: '#e7f3ff', color: '#007bff', borderRadius: '20px', fontSize: '13px', fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '30px', textAlign: 'center', color: '#999', fontSize: '12px', lineHeight: '1.6' }}>
        📢 电脑端访问可体验完整“Word Killer”数据大盘与高交互功能
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


