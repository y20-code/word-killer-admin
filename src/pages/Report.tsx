import React, { useEffect, useRef,useState } from 'react';
import { Card, Row, Col, Typography, Select, Button, Space, Progress, Table, Avatar, Tag,Spin } from 'antd';
import { 
  TrendingUp, CheckCircle, Clock, Download, Calendar, Users, 
  Award, Flame 
} from 'lucide-react';
import * as echarts from 'echarts';
import type { ColumnsType } from 'antd/es/table';
import { useUserStore } from '../store/userStore';
import { fetchReportData } from '../api/report';
import './Reports.scss'

const { Title, Text } = Typography;


export default function Report() {
  // 🏆 ECharts 挂载点
  const chartRef = useRef<HTMLDivElement>(null);
  const currentUser = useUserStore((state) => state.currentUser);

  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // 如果没有登录用户，直接返回
    if (!currentUser?.id) return;

    setIsLoading(true);
    
    // 🚀 瞬间注入极其完美的“英语教学场景”模拟数据！
    setTimeout(() => {
      setReportData({
        kpi: { 
          avgAccuracy: 82.5,  // 学生的真实平均正确率
          totalWords: 3450    // 涵盖四六级/高考的核心词汇量
        },
        topErrors: [
          // 极其真实的易错词汇，带上词性和准确释义，细节拉满！
          { word: 'Embarrass', meaning: 'v. 使尴尬；使难堪', count: 125, mastery: 25 },
          { word: 'Environment', meaning: 'n. 环境；周围状况', count: 98, mastery: 35 },
          { word: 'Guarantee', meaning: 'v./n. 保证；担保', count: 86, mastery: 42 },
          { word: 'Pronunciation', meaning: 'n. 发音；读法', count: 70, mastery: 50 }
        ],
        leaderBoard: [
          // 真实的学校班级命名，排名错落有致，甚至加上了你自己的名字作为彩蛋！
          { rank: 1, name: '李明', class: '高三(1)班', vocab: 4520, accuracy: 96, badges: ['award', 'flame'], initials: 'L' },
          { rank: 2, name: '杨林森', class: '英语强化特训营', vocab: 4100, accuracy: 94, badges: ['award'], initials: 'Y' },
          { rank: 3, name: '王晓华', class: '高三(2)班', vocab: 3850, accuracy: 90, badges: ['flame'], initials: 'W' },
          { rank: 4, name: '刘洋', class: '高二(5)班', vocab: 3600, accuracy: 88, badges: [], initials: 'L' },
          { rank: 5, name: '陈思思', class: '高一(3)班', vocab: 3120, accuracy: 85, badges: [], initials: 'C' }
        ]
      });
      setIsLoading(false);
    }, 500); 

  }, [currentUser]);

  useEffect(() => {
    let myChart: echarts.ECharts | null = null;

    if (chartRef.current && reportData) {
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
  }, [reportData]);

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

  if (isLoading) return <div style={{textAlign:'center', padding:'50px'}}><Spin size="large"/></div>;

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
            <Title level={2} className="kpi-value">{reportData.kpi.avgAccuracy}%</Title>
            <Progress percent={Number(reportData.kpi.avgAccuracy)} showInfo={false} strokeColor="#137fec" size="small" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="kpi-card">
            <div className="kpi-header">
              <div className="icon-box purple"><CheckCircle size={24} /></div>
              <Tag color="success" bordered={false}>+12% ↑</Tag>
            </div>
            <Text type="secondary" strong>总掌握词汇数</Text>
            <Title level={2} className="kpi-value">{reportData.kpi.totalWords}</Title>
            <Progress percent={80} showInfo={false} strokeColor="#a855f7"/>
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
          <Card title="词汇类别掌握情况" bordered={false} className="chart-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text strong>名词 (Nouns)</Text><Text strong style={{color:'#137fec'}}>92%</Text></div><Progress percent={92} showInfo={false} strokeColor="#137fec" /></div>
              <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text strong>动词 (Verbs)</Text><Text strong style={{color:'#137fec'}}>78%</Text></div><Progress percent={78} showInfo={false} strokeColor="#137fec" /></div>
              <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text strong>形容词 (Adjectives)</Text><Text strong style={{color:'#137fec'}}>85%</Text></div><Progress percent={85} showInfo={false} strokeColor="#137fec" /></div>
              <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><Text strong>副词 (Adverbs)</Text><Text strong style={{color:'#137fec'}}>64%</Text></div><Progress percent={64} showInfo={false} strokeColor="#137fec" /></div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          {/* 🏆 高频错误词汇：注入真实数据 */}
          <Card title="高频错误词汇" bordered={false} className="chart-card" bodyStyle={{ padding: 0 }}>
            <Table columns={errorColumns} dataSource={reportData.topErrors} pagination={false} size="middle" />
          </Card>
        </Col>
      </Row>

      {/* 5. 底部学生排行榜 */}
      <Card title="学生表现排位榜 (前5名)" extra={<Button type="link">查看完整排行</Button>} bordered={false} className="chart-card" bodyStyle={{ padding: 0 }} style={{marginTop:24}}>
        <Table columns={rankColumns} dataSource={reportData.leaderBoard} pagination={false} />
      </Card>

    </div>
  );
}