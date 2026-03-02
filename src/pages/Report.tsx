import React, { useEffect, useRef } from 'react';
import { Card, Row, Col, Typography, Select, Button, Space, Progress, Table, Avatar, Tag } from 'antd';
import { 
  TrendingUp, CheckCircle, Clock, Download, Calendar, Users, 
  Award, Flame 
} from 'lucide-react';
import * as echarts from 'echarts';
import type { ColumnsType } from 'antd/es/table';
import './Reports.scss'

const { Title, Text } = Typography;

// --- Mock 数据区 ---
const errorWordsData = [
  { key: '1', word: 'Ambiguous', meaning: 'adj. 模棱两可的', count: 124, mastery: 32 },
  { key: '2', word: 'Conspicuous', meaning: 'adj. 显眼的', count: 98, mastery: 45 },
  { key: '3', word: 'Hypothesis', meaning: 'n. 假设', count: 82, mastery: 58 },
];

const leaderboardData = [
  { key: '1', rank: 1, name: 'Sarah Williams', class: '英语 A 班', vocab: 3420, accuracy: 98.5, badges: ['award', 'flame'], avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { key: '2', rank: 2, name: 'James Chen', class: '英语 A 班', vocab: 3215, accuracy: 96.2, badges: ['award'], avatar: 'https://picsum.photos/seed/james/100/100' },
  { key: '3', rank: 3, name: 'Emily Lee', class: '英语 C 班', vocab: 3050, accuracy: 94.8, badges: ['flame'], initials: 'EL' },
];

export default function Report() {
  // 🏆 ECharts 挂载点
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let myChart: echarts.ECharts | null = null;
    if (chartRef.current) {
      myChart = echarts.init(chartRef.current);
      myChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
        xAxis: { 
          type: 'category', 
          boundaryGap: false,
          data: ['10月01', '10月07', '10月14', '10月21', '10月28', '今天'],
          axisLine: { lineStyle: { color: '#e2e8f0' } },
          axisLabel: { color: '#64748b' }
        },
        yAxis: { 
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
          axisLabel: { color: '#64748b' }
        },
        series: [{
          data: [40, 60, 45, 80, 70, 95],
          type: 'line',
          smooth: true,
          symbolSize: 0,
          lineStyle: { color: '#137fec', width: 3 },
          // 🏆 ECharts 渐变色填充魔法
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(19, 127, 236, 0.4)' },
              { offset: 1, color: 'rgba(19, 127, 236, 0.0)' }
            ])
          }
        }]
      });

      const handleResize = () => myChart?.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        myChart?.dispose();
      };
    }
  }, []);

  // --- 表格列定义 ---
  const errorColumns: ColumnsType<any> = [
    { title: '单词', key: 'word', render: (_, r) => <div><Text strong>{r.word}</Text><br/><Text type="secondary" style={{fontSize: 12}}>{r.meaning}</Text></div> },
    { title: '错误频次', dataIndex: 'count', render: (c) => <Text strong type="danger">{c} 次</Text> },
    { title: '掌握度', dataIndex: 'mastery', render: (m) => <Progress percent={m} size="small" strokeColor={m < 40 ? '#ef4444' : '#f59e0b'} /> },
    { title: '操作', key: 'action', render: () => <Button type="link" size="small">查看详情</Button> },
  ];

  const rankColumns: ColumnsType<any> = [
    { title: '排名', dataIndex: 'rank', width: 80, render: (r) => <div className={`rank-badge rank-${r > 3 ? 'other' : r}`}>{r}</div> },
    { title: '学生姓名', key: 'name', render: (_, r) => (
        <Space>
          {r.avatar ? <Avatar src={r.avatar} /> : <Avatar style={{ backgroundColor: '#eef2ff', color: '#6366f1' }}>{r.initials}</Avatar>}
          <Text strong>{r.name}</Text>
        </Space>
      )},
    { title: '班级', dataIndex: 'class', render: (c) => <Text type="secondary">{c}</Text> },
    { title: '词汇量', dataIndex: 'vocab', render: (v) => <Text strong>{v.toLocaleString()}</Text> },
    { title: '正确率', dataIndex: 'accuracy', render: (a) => <Text strong style={{ color: '#10b981' }}>{a}%</Text> },
    { title: '获得勋章', dataIndex: 'badges', render: (badges: string[]) => (
        <Space size="small">
          {badges.includes('award') && <Award size={18} color="#fbbf24" />}
          {badges.includes('flame') && <Flame size={18} color="#60a5fa" />}
        </Space>
      )}
  ];

  return (
    <div className="report-container">
      {/* 1. 顶部操作区 */}
      <div className="report-header">
        <Space size="large">
          <Select defaultValue="30days" style={{ width: 140 }} variant="filled" prefix={<Calendar size={16} />}>
            <Select.Option value="30days">过去 30 天</Select.Option>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="term">本学期</Select.Option>
          </Select>
          <Select defaultValue="all" style={{ width: 140 }} variant="filled" prefix={<Users size={16} />}>
            <Select.Option value="all">所有班级</Select.Option>
            <Select.Option value="classA">英语 A 班</Select.Option>
          </Select>
        </Space>
        <Button type="default" icon={<Download size={16} />}>导出报告</Button>
      </div>

      {/* 2. 核心 KPI 数据卡片 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card bordered={false} className="kpi-card">
            <div className="kpi-header">
              <div className="icon-box blue"><TrendingUp size={24} /></div>
              <Tag color="success" bordered={false}>+4.2% ↑</Tag>
            </div>
            <Text type="secondary" strong>平均正确率趋势</Text>
            <Title level={2} className="kpi-value">86.4%</Title>
            <Progress percent={86.4} showInfo={false} strokeColor="#137fec" size="small" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="kpi-card">
            <div className="kpi-header">
              <div className="icon-box purple"><CheckCircle size={24} /></div>
              <Tag color="success" bordered={false}>+12% ↑</Tag>
            </div>
            <Text type="secondary" strong>单词完成率</Text>
            <Title level={2} className="kpi-value">92.8%</Title>
            <Progress percent={92.8} showInfo={false} strokeColor="#a855f7" size="small" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="kpi-card">
            <div className="kpi-header">
              <div className="icon-box orange"><Clock size={24} /></div>
              <Tag color="default" bordered={false}>-2.1% ↓</Tag>
            </div>
            <Text type="secondary" strong>平均学习时长</Text>
            <Title level={2} className="kpi-value">45.2 <span style={{fontSize: 14, color: '#94a3b8', fontWeight: 'normal'}}>min/日</span></Title>
            <Progress percent={75} showInfo={false} strokeColor="#f97316" size="small" />
          </Card>
        </Col>
      </Row>

      {/* 3. 班级活跃度图表 (ECharts) */}
      <Card title={<><Title level={4} style={{margin: 0}}>班级学习活跃度</Title><Text type="secondary" style={{fontSize: 12}}>过去 30 天全校班级平均互动频率分析</Text></>} bordered={false} className="chart-card">
        <div ref={chartRef} style={{ height: 300, width: '100%' }} />
      </Card>

      {/* 4. 中间两列分析 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="词汇类别掌握情况" extra={<Select defaultValue="type" variant="borderless" options={[{value:'type',label:'按词性'},{value:'diff',label:'按难度'}]} />} bordered={false} className="chart-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text strong>名词 (Nouns)</Text><Text strong style={{color:'#137fec'}}>92%</Text></div><Progress percent={92} showInfo={false} strokeColor="#137fec" /></div>
              <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text strong>动词 (Verbs)</Text><Text strong style={{color:'#137fec'}}>78%</Text></div><Progress percent={78} showInfo={false} strokeColor="#137fec" /></div>
              <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text strong>形容词 (Adjectives)</Text><Text strong style={{color:'#137fec'}}>85%</Text></div><Progress percent={85} showInfo={false} strokeColor="#137fec" /></div>
              <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text strong>副词 (Adverbs)</Text><Text strong style={{color:'#137fec'}}>64%</Text></div><Progress percent={64} showInfo={false} strokeColor="#137fec" /></div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="高频错误词汇" extra={<Text type="secondary" style={{fontSize: 12}}>按错误次数排序</Text>} bordered={false} className="chart-card" bodyStyle={{ padding: 0 }}>
            <Table columns={errorColumns} dataSource={errorWordsData} pagination={false} size="middle" />
          </Card>
        </Col>
      </Row>

      {/* 5. 底部学生排行榜 */}
      <Card title="学生表现排位榜 (前5名)" extra={<Button type="link">查看完整排行</Button>} bordered={false} className="chart-card" bodyStyle={{ padding: 0 }}>
        <Table columns={rankColumns} dataSource={leaderboardData} pagination={false} />
      </Card>

    </div>
  );
}