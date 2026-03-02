import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Avatar, Button, List, Tag, Spin, message } from 'antd';
import { 
  TeamOutlined, BookOutlined, BarChartOutlined, 
  ClockCircleOutlined, AlertOutlined 
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useUserStore } from '../store/userStore';
import { fetchDashboardData } from '../api/dashboard';
import './Dashboard.scss';

const { Title, Text } = Typography;

export default function Dashboard() {
    const currentUser = useUserStore((state) => state.currentUser);
    
    // 🏆 1. 定义动态状态（加载状态 + 数据状态）
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        activeClassCount: 0,
        pendingAssignmentCount: 0,
        avgCorrectRate: 0,
        chartData: [] as any[]
    });

    // 🏆 2. 页面一加载，立刻向后端拉取当前老师的数据
    useEffect(() => {
        const loadData = async () => {
            if (!currentUser?.id) return;
            setIsLoading(true);
            try {
                // 调用我们写好的 API 获取聚合数据
                const data = await fetchDashboardData(currentUser.id);
                setStats(data);
            } catch (error) {
                message.error("大盘数据加载失败");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [currentUser]);

    // 🏆 3. 将 ECharts 的死数据替换为 stats.chartData
    const classChartOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b} : {c}% 掌握率' },
        grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', max: 100, splitLine: { show: false }, axisLabel: { show: false } },
        yAxis: { 
            type: 'category', 
            data: stats.chartData.map(item => item.name).reverse(), // 提取真实的班级名称
            axisLine: { show: false }, 
            axisTick: { show: false } 
        },
        series: [{
            name: '进度',
            type: 'bar',
            data: stats.chartData.map(item => item).reverse(), // 提取真实的柱状图数据
            barWidth: 20,
            itemStyle: { borderRadius: [0, 8, 8, 0] },
            label: { show: true, position: 'right', formatter: '{c}%', fontWeight: 'bold' }
        }]
    };

    // 静态数据保留（用于 UI 占位，日后可以再开接口替换）
    const scheduleData = [
        { time: '09:00 AM', title: '词汇小测 - A班', desc: '单元 4: 环境与气候' },
        { time: '11:30 AM', title: '复习课 - C班', desc: '高频学术词汇' },
    ];
    const alertData = [
        { title: '词汇量进展落后', desc: '有 5 名学生在过去 7 天内未完成任何练习任务。', type: 'error' },
    ];

    // 加载时的优雅转圈圈动画
    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" tip="正在生成数据大盘..." /></div>;
    }

    return (
        <>
          {/* 顶层动态数据卡片 */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="custom-card">
                <div className="stat-card-body">
                  <Avatar size={54} className="avatar-blue" icon={<TeamOutlined />} />
                  <div><Text type="secondary">活跃班级</Text><Title level={2}>{stats.activeClassCount}</Title></div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="custom-card">
                <div className="stat-card-body">
                  <Avatar size={54} className="avatar-orange" icon={<BookOutlined />} />
                  <div><Text type="secondary">本班已发作业</Text><Title level={2}>{stats.pendingAssignmentCount}</Title></div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="custom-card">
                <div className="stat-card-body">
                  <Avatar size={54} className="avatar-green" icon={<BarChartOutlined />} />
                  <div><Text type="secondary">全局平均正确率</Text><Title level={2}>{stats.avgCorrectRate}%</Title></div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 中层：动态 ECharts 图表 + 今日安排 */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} xl={16}>
              <Card 
                title="各班级表现对比" 
                extra={<Button type="link" onClick={() => message.info('即将跳转到详细数据报告页...')}>查看完整报告</Button>}
                bordered={false} 
                className="custom-card"
              >
                <ReactECharts option={classChartOption} style={{ height: 300, width: '100%' }} />
              </Card>
            </Col>
            
            
            <Col xs={24} xl={8}>
              <Card title="今日安排" bordered={false} className="custom-card">
                <List
                  className="schedule-list"
                  itemLayout="horizontal"
                  dataSource={scheduleData}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar className="avatar-blue" icon={<ClockCircleOutlined />} />}
                        title={<>{item.title} <Tag color="blue" style={{ marginLeft: 8 }}>{item.time}</Tag></>}
                        description={item.desc}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* 底层：重点警报 */}
          <Row style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title={<><AlertOutlined /> 重点关注警报</>} bordered={false} className="custom-card alert-card">
                <List
                  className="alert-list"
                  dataSource={alertData}
                  renderItem={item => (
                    <List.Item actions={[<Button type="primary" danger={item.type === 'error'} size="small">立即督促</Button>]}>
                      <List.Item.Meta
                        avatar={<Avatar className={item.type === 'error' ? 'avatar-error' : 'avatar-warning'} icon={<AlertOutlined />} />}
                        title={item.title}
                        description={item.desc}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </>
    )
}