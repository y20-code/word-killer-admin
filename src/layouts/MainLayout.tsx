import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Badge, Avatar, Button } from 'antd';
import { 
  DashboardOutlined, TeamOutlined, BookOutlined, BarChartOutlined, 
  SettingOutlined, BellOutlined, PlusOutlined 
} from '@ant-design/icons';
import '../pages/Dashboard.scss'; // 复用之前的样式

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 获取当前路由路径

  // 🏆 核心：将 menu 的 key 直接设置为路由路径！
  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '班级概览' },
    { key: '/students', icon: <TeamOutlined />, label: '学生列表' },
    { key: '/assignments', icon: <BookOutlined />, label: '作业布置' },
    { key: '/reports', icon: <BarChartOutlined />, label: '数据报告' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
  ];

  // 根据当前路由，动态决定 Header 的标题
  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.key === location.pathname);
    return currentItem ? currentItem.label : '控制台';
  };

  return (
    <Layout className="dashboard-layout">
      {/* ================= 左侧栏 ================= */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={256} theme="dark">
        <div className="logo-container">
          <div className="logo-icon">
            <BookOutlined />
          </div>
          {!collapsed && <span className="logo-text">VocabLearn</span>}
        </div>
        
        {/* 🏆 点击菜单时，触发路由跳转！ */}
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} // 自动高亮当前所在的路由
          items={menuItems} 
          onClick={({ key }) => navigate(key)} 
        />
      </Sider>

      {/* ================= 右侧主区 ================= */}
      <Layout className="dashboard-main">
        <Header className="dashboard-header">
          <Title level={4}>{getPageTitle()}</Title>
          <div className="header-actions">
            <Badge dot>
              <BellOutlined className="bell-icon" />
            </Badge>
            <Button type="primary" icon={<PlusOutlined />} className="btn-new-task">
              新建任务
            </Button>
            <Avatar src="https://picsum.photos/seed/prof/100/100" />
          </div>
        </Header>

        <Content className="dashboard-content">
          {/* 🏆 见证奇迹的时刻：Outlet 是路由插槽，Dashboard 或 学生列表 会在这里渲染！ */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}