import { useState } from 'react';
import {  Menu, Card, Row, Col, Typography, Badge, Avatar, Button, List, Tag } from 'antd';
import { 
  DashboardOutlined, TeamOutlined, BookOutlined, BarChartOutlined, 
  SettingOutlined, BellOutlined, PlusOutlined, ClockCircleOutlined, AlertOutlined 
} from '@ant-design/icons';

import ReactECharts from 'echarts-for-react';
import './Dashboard.scss';

const { Title, Text } = Typography;

interface ClassData {
  key: string;
  name: string;
  progress: number;
  level: string;
}

export default function Dashboard() {

    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { key: '1', icon: <DashboardOutlined />, label: '班级概览' },
        { key: '2', icon: <TeamOutlined />, label: '学生列表' },
        { key: '3', icon: <BookOutlined />, label: '作业布置' },
        { key: '4', icon: <BarChartOutlined />, label: '数据报告' },
        { key: '5', icon: <SettingOutlined />, label: '设置' },
    ];

    const tableData: ClassData[] = [
        { key: '1', name: '英语 A 班', progress: 92, level: '优秀' },
        { key: '2', name: '英语 B 班', progress: 78, level: '良好' },
        { key: '3', name: '英语 C 班', progress: 85, level: '良好' },
        { key: '4', name: '英语 D 班', progress: 45, level: '预警' },
    ];

    const classChartOption = {
        tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b} : {c}%掌握率' // 悬浮提示
        },
        grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
        xAxis: { 
        type: 'value', 
        max: 100, 
        splitLine: { show: false }, // 隐藏网格线，更极简
        axisLabel: { show: false }  // 隐藏底部刻度
        },
        yAxis: { 
        type: 'category', 
        // 注意：ECharts 的柱状图默认是从下往上画的，所以顺序要反过来
        data: ['英语 D 班', '英语 C 班', '英语 B 班', '英语 A 班'], 
        axisLine: { show: false }, 
        axisTick: { show: false } 
        },
        series: [
        {
            name: '进度',
            type: 'bar',
            data: [
            { value: 64, itemStyle: { color: '#94a3b8' } }, // D班落后，置灰
            { value: 85, itemStyle: { color: '#60a5fa' } },
            { value: 78, itemStyle: { color: '#3b82f6' } },
            { value: 92, itemStyle: { color: '#1677ff' } }  // A班最好，深蓝
            ],
            barWidth: 20, // 柱子宽度
            itemStyle: { borderRadius: [0, 8, 8, 0] }, // 右侧圆角
            label: {
            show: true,
            position: 'right', // 文字显示在柱子右边
            formatter: '{c}%',
            fontWeight: 'bold'
            }
        }
        ]
    };

    const scheduleData = [
        { time: '09:00 AM', title: '词汇小测 - A班', desc: '单元 4: 环境与气候' },
        { time: '11:30 AM', title: '复习课 - C班', desc: '高频学术词汇' },
        { time: '02:00 PM', title: '新词引入 - B班', desc: '单元 5: 商业与经济' },
    ];

    const alertData = [
        { title: '词汇量进展落后', desc: '有 5 名学生在过去 7 天内未完成任何练习任务。', type: 'error' },
        { title: '低分词汇类别预警', desc: 'D班在"科技与创新"的正确率降至 45%。', type: 'warning' },
    ];

    return (
        <>
          {/* 1. 顶层数据卡片 */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="custom-card">
                <div className="stat-card-body">
                  <Avatar size={54} className="avatar-blue" icon={<TeamOutlined />} />
                  <div><Text type="secondary">活跃班级</Text><Title level={2}>4</Title></div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="custom-card">
                <div className="stat-card-body">
                  <Avatar size={54} className="avatar-orange" icon={<BookOutlined />} />
                  <div><Text type="secondary">待处理作业</Text><Title level={2}>12</Title></div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="custom-card">
                <div className="stat-card-body">
                  <Avatar size={54} className="avatar-green" icon={<BarChartOutlined />} />
                  <div><Text type="secondary">班级平均正确率</Text><Title level={2}>84%</Title></div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 2. 中层：ECharts 图表 + 今日安排 */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} xl={16}>
              <Card 
                title="各班级表现对比" 
                extra={<Button type="link">查看完整报告</Button>}
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

          {/* 3. 底层：重点警报 */}
          <Row style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card 
                title={<><AlertOutlined /> 重点关注警报</>} 
                bordered={false} 
                className="custom-card alert-card"
              >
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