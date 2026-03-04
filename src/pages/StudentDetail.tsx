import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as echarts from 'echarts'; 
import { Card, Row, Col, Typography, Avatar, Button, Space, Table, Tag, Progress, Spin, message, Modal, Tabs } from 'antd';
import { ArrowLeftOutlined, MailOutlined, DownloadOutlined, BookOutlined, ThunderboltOutlined, CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { fetchStudentDetail } from '../api/student';
import './StudentDetail.scss';

const { Title, Text,Link } = Typography;

const LEVEL_CONFIG = {
  0: { text: '未学', color: 'default', percent: 0 },
  1: { text: '初识', color: 'red', percent: 20 },
  2: { text: '熟悉', color: 'orange', percent: 40 },
  3: { text: '巩固', color: 'blue', percent: 60 },
  4: { text: '牢固', color: 'cyan', percent: 80 },
  5: { text: '永久掌握', color: 'green', percent: 100 },
};

export default function StudentDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // 拿到 URL 里的学生 ID
  const chartRef = useRef<HTMLDivElement>(null);

  // 🏆 1. 定义页面的动态数据状态
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);

  const [isWordModalVisible, setIsWordModalVisible] = useState(false);

  // 🏆 2. 页面加载时拉取数据
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await fetchStudentDetail(id);
        setStudentData(data);
      } catch (error) {
        message.error("无法加载学生详情");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 🏆 3. 当数据加载完毕后，再初始化并画出 ECharts 图表
  useEffect(() => {
    let myChart: echarts.ECharts | null = null;

    // 只有当 DOM 存在，并且数据已经拉回来的时候，才去画图！
    if (chartRef.current && studentData) {
      myChart = echarts.init(chartRef.current);
      
      myChart.setOption({
        grid: { top: 10, right: 10, bottom: 20, left: 40 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['三周前', '两周前', '上周', '今天'], axisLine: { show: false } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } },
        series: [{
          data: studentData.chartData, // 📈 注入真实的折线图动态数据！
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

      const handleResize = () => myChart?.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        myChart?.dispose();
      };
    }
  }, [studentData]); // 🚨 依赖项：只有 studentData 变化时，图表才会重绘

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}><Spin size="large" /></div>;
  }

  if (!studentData) return null; // 防御性编程

  const wordColumns = [
    { title: '单词', key: 'word', render: (_:any, r:any) => <div><Text strong>{r.word}</Text><br/><Text type="secondary" italic style={{ fontSize: 12 }}>{r.meaning}</Text></div> },
    { title: '学习状态', key: 'level', render: (_:any, r:any) => <Tag color={LEVEL_CONFIG[r.level as keyof typeof LEVEL_CONFIG].color}>{LEVEL_CONFIG[r.level as keyof typeof LEVEL_CONFIG].text}</Tag> },
    { title: '答题数据', key: 'stats', render: (_:any, r:any) => <Text type="secondary">对:{r.correctCount} / 错:{r.wrongCount}</Text> },
    { title: '最后学习', dataIndex: 'date' }
  ];

  return (
    <div className="student-detail-container">
      {/* 顶部个人信息悬浮栏 */}
      <header className="detail-header">
        <div className="header-left">
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/students')}>返回列表</Button>
          <div className="divider" />
          <Avatar className="detail-avatar" src={studentData.info.customAvatar} style={{ backgroundColor: '#f1f5f9' }}>
            {studentData.info.fullName?.[0]}
          </Avatar>
          <div className="info">
            <Title level={4}>{studentData.info.fullName || studentData.info.email}</Title>
            <Text type="secondary">所属班级: {studentData.info.className} • 学号: {id}</Text>
          </div>
        </div>
        <Space>
          <Button icon={<MailOutlined />} className="btn-ghost">发消息</Button>
          <Button type="primary" icon={<DownloadOutlined />}>下载报告</Button>
        </Space>
      </header>

      <div className="detail-content">
        {/* 第一行：统计卡片 */}
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Card 
              className="stat-card" 
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              hoverable
              onClick={() => setIsWordModalVisible(true)}
            >
              <div className="stat-icon blue"><BookOutlined /></div>
              <div>
                <Text type="secondary">已学总词汇量 <Link>(点击查看明细)</Link></Text>
                <Title level={3}>{studentData.stats.words}</Title>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="stat-card">
              <div className="stat-icon orange"><ThunderboltOutlined /></div>
              <div>
                <Text type="secondary">连续打卡</Text>
                <Title level={3}>{studentData.stats.streak} 天</Title>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="stat-card">
              <div className="stat-icon green"><CheckCircleOutlined /></div>
              <div>
                <Text type="secondary">平均正确率</Text>
                <Title level={3}>{studentData.stats.correctRate}%</Title>
              </div>
            </Card>
          </Col>
        </Row>

        

        {/* 第二行：原生 ECharts 图表 + Antd 圆环进度条 */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={16}>
            {/* 🌟 1. 加上高度 100%，让它跟着 Col 走 */}
            <Card title="词汇增长趋势" style={{ height: '100%' }}>
              <div ref={chartRef} style={{ height: 260, width: '100%' }} />
            </Card>
          </Col>
          <Col span={8}>
            {/* 🌟 2. 同样加上高度 100% */}
            <Card title="课程进度" className="progress-center-card" style={{ height: '100%' }}>
              <div className="circle-container">
                <Progress 
                   type="circle" 
                   percent={studentData.stats.correctRate > 0 ? 65 : 0} 
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
            </Card>
          </Col>
        </Row>

        {/* 第三行：Antd 数据表格 */}
        <Card style={{ marginTop: 24 }} title={<><HistoryOutlined /> 最近活动</>} extra={<Button type="link" onClick={() => setIsWordModalVisible(true)}>查看全部</Button>}>
          <Table 
            dataSource={studentData.recentActivity} 
            pagination={false}
            columns={[
              { title: '学习单词', key: 'word', render: (_, r:any) => (
                <div><Text strong>{r.word}</Text><br/><Text type="secondary" italic style={{ fontSize: 12 }}>{r.meaning}</Text></div>
              )},
              { title: '掌握等级', key: 'levelTag', render: (_, r:any) => {
                  const cfg = LEVEL_CONFIG[r.level as keyof typeof LEVEL_CONFIG];
                  return <Tag color={cfg.color}>{cfg.text} (LV.{r.level})</Tag>;
              }},
              { title: '进度条', key: 'progress', render: (_, r:any) => {
                  const cfg = LEVEL_CONFIG[r.level as keyof typeof LEVEL_CONFIG];
                  return <Progress percent={cfg.percent} size="small" strokeColor={cfg.color} />;
              }},
              { title: '最后学习时间', dataIndex: 'date' }
            ]}
          />
        </Card>
      </div>

      <Modal 
        title={`${studentData.info.fullName} 的个人词汇库`}
        open={isWordModalVisible} 
        onCancel={() => setIsWordModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="ALL" items={[
          { key: 'ALL', label: '全部词汇', children: <Table dataSource={studentData.allWords} columns={wordColumns} pagination={{ pageSize: 5 }} /> },
          { key: 'L1', label: <Tag color="red">初识 (LV.1)</Tag>, children: <Table dataSource={studentData.allWords.filter((w:any) => w.level === 1)} columns={wordColumns} pagination={{ pageSize: 5 }} /> },
          { key: 'L2', label: <Tag color="orange">熟悉 (LV.2)</Tag>, children: <Table dataSource={studentData.allWords.filter((w:any) => w.level === 2)} columns={wordColumns} pagination={{ pageSize: 5 }} /> },
          { key: 'L3', label: <Tag color="blue">巩固 (LV.3)</Tag>, children: <Table dataSource={studentData.allWords.filter((w:any) => w.level === 3)} columns={wordColumns} pagination={{ pageSize: 5 }} /> },
          { key: 'L4_5', label: <Tag color="green">已牢记 (LV.4-5)</Tag>, children: <Table dataSource={studentData.allWords.filter((w:any) => w.level >= 4)} columns={wordColumns} pagination={{ pageSize: 5 }} /> },
        ]} />
      </Modal>
    </div>
  );
}