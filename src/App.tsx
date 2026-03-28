// src/App.tsx
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


