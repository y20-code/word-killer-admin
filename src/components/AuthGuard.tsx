import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  // 1. 搜身：检查有没有通行证
  const token = localStorage.getItem('word_killer_token');

  // 2. 核心拦截逻辑（你记忆中最深的那句话！）
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 3. 搜身通过，放行！(渲染被包裹的真实页面)
  return <>{children}</>;
}