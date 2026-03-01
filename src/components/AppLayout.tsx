import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { DashboardOutlined, ReadOutlined } from '@ant-design/icons';
// 👇 引入路由核心组件
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC = () => {
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const navigate = useNavigate(); // 用来跳转
    const location = useLocation(); // 用来获取当前在哪个页面

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider breakpoint="lg" collapsedWidth="0">
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px', fontWeight: 'bold' }}>
                    Word Killer
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    // 这里的 key 要和路由路径对应
                    selectedKeys={[location.pathname]} 
                    onClick={({ key }) => navigate(key)} // 点击菜单跳转
                    items={[
                        {
                            key: '/',
                            icon: <DashboardOutlined />,
                            label: '仪表盘',
                        },
                        {
                            key: '/words',
                            icon: <ReadOutlined />,
                            label: '单词本',
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                    单词后台管理系统
                </Header>
                <Content style={{ margin: '24px 16px 0' }}>
                    <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                        
                        {/* 🔥 重点：Outlet 是个占位符 */}
                        {/* 路由匹配到哪个页面，那个页面就会显示在这里 */}
                        <Outlet />
                        
                    </div>
                </Content>
                <Layout.Footer style={{ textAlign: 'center' }}>
                    Word Killer ©2026 Created by You
                </Layout.Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;