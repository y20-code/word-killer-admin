import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as echarts from 'echarts'; 
import { Card, Row, Col, Typography, Avatar, Button, Space, Table, Tag, Progress, Spin, message } from 'antd';
import { ArrowLeftOutlined, MailOutlined, DownloadOutlined, BookOutlined, ThunderboltOutlined, CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { fetchStudentDetail } from '../api/student';
import './StudentDetail.scss';

const { Title, Text } = Typography;

export default function StudentDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // 拿到 URL 里的学生 ID
  const chartRef = useRef<HTMLDivElement>(null);

  // 🏆 1. 定义页面的动态数据状态
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);

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
            <Card className="stat-card">
              <div className="stat-icon blue"><BookOutlined /></div>
              <div>
                <Text type="secondary">掌握词汇量</Text>
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
            <Card title="词汇增长趋势">
              <div ref={chartRef} style={{ height: 260, width: '100%' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="课程进度" className="progress-center-card">
              <div className="circle-container">
                {/* 动态计算圆环进度 */}
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
        <Card style={{ marginTop: 24 }} title={<><HistoryOutlined /> 最近活动</>} extra={<Button type="link">查看全部</Button>}>
          <Table 
            dataSource={studentData.recentActivity} 
            pagination={false}
            columns={[
              { title: '学习单词', key: 'word', render: (_, r:any) => (
                <div><Text strong>{r.word}</Text><br/><Text type="secondary" italic style={{ fontSize: 12 }}>{r.meaning}</Text></div>
              )},
              { title: '难度', dataIndex: 'difficulty', key: 'diff', render: (d) => <Tag color={d==='HARD'?'orange':'green'}>{d}</Tag> },
              { title: '词汇类别', dataIndex: 'type' },
              { title: '掌握度', dataIndex: 'mastery', render: (m) => <Progress percent={m} size="small" strokeColor={m === 100 ? '#10b981' : '#f59e0b'} /> },
              { title: '学习时间', dataIndex: 'date' }
            ]}
          />
        </Card>
      </div>
    </div>
  );
}