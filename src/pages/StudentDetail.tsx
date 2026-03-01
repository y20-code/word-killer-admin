// src/pages/StudentDetail.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as echarts from 'echarts'; // 🏆 引入纯原生官方 ECharts
import { Card, Row, Col, Typography, Avatar, Button, Space, Table, Tag, Progress } from 'antd';
import { ArrowLeftOutlined, MailOutlined, DownloadOutlined, BookOutlined, ThunderboltOutlined, CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import './StudentDetail.scss';

const { Title, Text } = Typography;

export default function StudentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // 🏆 1. 创建对 DOM 节点的引用，这是 React 结合外部可视化库的标准姿势
  const chartRef = useRef<HTMLDivElement>(null);

  // 🏆 2. 使用 useEffect 在组件挂载后初始化图表
  useEffect(() => {
    let myChart: echarts.ECharts | null = null;

    if (chartRef.current) {
      // 初始化图表实例
      myChart = echarts.init(chartRef.current);
      
      // 配置图表
      myChart.setOption({
        grid: { top: 10, right: 10, bottom: 20, left: 40 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['Oct 25', 'Nov 05', 'Nov 15', 'Today'], axisLine: { show: false } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } },
        series: [{
          data: [800, 1000, 1250, 1420],
          type: 'line',
          smooth: true,
          lineStyle: { color: '#137fec', width: 3 },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#137fec44' },
              { offset: 1, color: '#137fec00' }
            ]) 
          },
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#137fec' }
        }]
      });

      // 🏆 监听窗口大小变化，让图表自动响应式缩放
      const handleResize = () => myChart?.resize();
      window.addEventListener('resize', handleResize);

      // 组件卸载时清理内存，防止内存泄漏 (高级前端必做！)
      return () => {
        window.removeEventListener('resize', handleResize);
        myChart?.dispose();
      };
    }
  }, []);

  // 最近活动数据 (交给 Antd Table)
  const activityData = [
    { key: '1', word: 'Pragmatic', meaning: 'Dealing with things sensibly...', difficulty: 'MEDIUM', type: 'Adjective', mastery: 75, date: 'Today, 10:42 AM' },
    { key: '2', word: 'Ubiquitous', meaning: 'Present, appearing, everywhere...', difficulty: 'HARD', type: 'Adjective', mastery: 45, date: 'Today, 09:15 AM' },
    { key: '3', word: 'Synergy', meaning: 'The interaction of two or more agents...', difficulty: 'EASY', type: 'Noun', mastery: 100, date: 'Yesterday, 4:20 PM' },
  ];

  return (
    <div className="student-detail-container">
      {/* 顶部个人信息悬浮栏 */}
      <header className="detail-header">
        <div className="header-left">
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/students')}>返回列表</Button>
          <div className="divider" />
          <Avatar className="detail-avatar">JD</Avatar>
          <div className="info">
            <Title level={4}>Julianne Davies</Title>
            <Text type="secondary">Advanced Level • Student ID: #{id || '88210'}</Text>
          </div>
        </div>
        <Space>
          <Button icon={<MailOutlined />} className="btn-ghost">发消息</Button>
          <Button type="primary" icon={<DownloadOutlined />}>下载报告</Button>
        </Space>
      </header>

      <div className="detail-content">
        {/* 第一行：使用 Antd Card 做的统计卡片 */}
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Card className="stat-card">
              <div className="stat-icon blue"><BookOutlined /></div>
              <div>
                <Text type="secondary">掌握词汇量</Text>
                <Title level={3}>1,420</Title>
                <Text type="success" style={{ fontSize: 12 }}>+12% vs 上月</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="stat-card">
              <div className="stat-icon orange"><ThunderboltOutlined /></div>
              <div>
                <Text type="secondary">连续打卡</Text>
                <Title level={3}>15 天</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>历史最高: 24 天</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="stat-card">
              <div className="stat-icon green"><CheckCircleOutlined /></div>
              <div>
                <Text type="secondary">平均正确率</Text>
                <Title level={3}>92%</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>基于最近500次复习</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 第二行：原生 ECharts 图表 + Antd 圆环进度条 */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={16}>
            <Card title="词汇增长趋势">
              {/* 🏆 这里是 ECharts 的挂载点！ */}
              <div ref={chartRef} style={{ height: 260, width: '100%' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="课程进度" className="progress-center-card">
              {/* 这里使用 Antd 的 Progress，完全符合“部分使用 Antd”的需求 */}
              <div className="circle-container">
                <Progress 
                   type="circle" 
                   percent={78} 
                   strokeWidth={10} 
                   size={180} 
                   strokeColor="#137fec" 
                   format={(percent) => (
                     <div className="circle-label">
                       <span className="percent">{percent}%</span>
                       <span className="text">已完成</span>
                     </div>
                   )}
                />
              </div>
              <Row gutter={12} style={{ marginTop: 24 }}>
                <Col span={12}><div className="sub-stat"><span>剩余</span><strong>12 节课</strong></div></Col>
                <Col span={12}><div className="sub-stat"><span>预计完成</span><strong>12月14日</strong></div></Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* 第三行：Antd 数据表格 */}
        <Card 
          style={{ marginTop: 24 }} 
          title={<><HistoryOutlined /> 最近活动</>} 
          extra={<Button type="link">查看全部</Button>}
        >
          <Table 
            dataSource={activityData} 
            pagination={false}
            columns={[
              { title: '学习单词', key: 'word', render: (_, r) => (
                <div><Text strong>{r.word}</Text><br/><Text type="secondary" italic style={{ fontSize: 10 }}>{r.meaning}</Text></div>
              )},
              { title: '难度', dataIndex: 'difficulty', key: 'diff', render: (d) => <Tag color={d==='HARD'?'orange':d==='MEDIUM'?'blue':'green'}>{d}</Tag> },
              { title: '词性', dataIndex: 'type' },
              { title: '掌握度', dataIndex: 'mastery', render: (m) => <Progress percent={m} size="small" strokeColor="#137fec" /> },
              { title: '学习时间', dataIndex: 'date' }
            ]}
          />
        </Card>
      </div>
    </div>
  );
}