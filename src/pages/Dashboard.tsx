import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Avatar, Button, List, Tag, Spin, message, Empty, Modal, Result, Progress } from 'antd';
import { 
  TeamOutlined, BookOutlined, BarChartOutlined, 
  AlertOutlined, PlusOutlined
} from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardData } from '../api/dashboard';
import './Dashboard.scss';

const { Title, Text } = Typography;

export default function Dashboard() {
    const currentUser = useUserStore((state) => state.currentUser);
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(true);
    
    // 🌟 1. 状态替换：去掉 alerts，换成 hardWords
    const [stats, setStats] = useState({
        activeClassCount: 0,
        pendingAssignmentCount: 0,
        avgCorrectRate: 0,
        chartData: [] as any[],
        hardWords: [] as any[] // 👈 接住后端传来的易错词数据
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState({ className: '', slackers: [] as any[] });

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser?.id) return;
            setIsLoading(true);
            try {
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

    const onClassClick = (item: any) => {
        setModalData({ className: item.name, slackers: item.slackers });
        setIsModalVisible(true);
    };

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" tip="正在生成数据大盘..." /></div>;
    }

    return (
        <div className="dashboard-container">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="custom-card">
                <div className="stat-card-body">
                  <Avatar size={54} className="avatar-blue" icon={<TeamOutlined />} />
                  <div>
                    <Text type="secondary">
                      活跃班级
                    </Text>
                    <Title level={2}>
                      {stats.activeClassCount}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}><Card bordered={false} className="custom-card"><div className="stat-card-body"><Avatar size={54} className="avatar-orange" icon={<BookOutlined />} /><div><Text type="secondary">本班已发作业</Text><Title level={2}>{stats.pendingAssignmentCount}</Title></div></div></Card></Col>
            <Col xs={24} sm={8}><Card bordered={false} className="custom-card"><div className="stat-card-body"><Avatar size={54} className="avatar-green" icon={<BarChartOutlined />} /><div><Text type="secondary">全局平均正确率</Text><Title level={2}>{stats.avgCorrectRate}%</Title></div></div></Card></Col>
          </Row>

          <Row style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card 
                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>各班级昨日作业完成情况 (点击查看详情 🖱️)</span>} 
                bordered={false} 
                className="custom-card"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/classes/create')}>新建班级与录入名单</Button>}
              >
                {stats.chartData.length > 0 ? (
                    <List
                      dataSource={stats.chartData}
                      renderItem={item => {
                        const rate = item.value; 
                        const slackersCount = item.slackers.length; 
                        
                        let color = '#ef4444'; 
                        let status: 'exception' | 'success' | 'normal' = 'exception';
                        
                        if (rate >= 80) {
                          color = '#10b981'; 
                          status = 'success';
                        } else if (rate >= 60) {
                          color = '#f59e0b'; 
                          status = 'normal';
                        }

                        return (
                          <List.Item 
                            onClick={() => onClassClick(item)}
                            style={{ 
                                cursor: 'pointer', 
                                padding: '16px 24px', 
                                backgroundColor: '#f8fafc', 
                                marginBottom: 16, 
                                borderRadius: 8, 
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                          >
                            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                              
                              <div style={{ width: '20%', fontSize: '16px', fontWeight: 'bold', color: color }}>
                                {item.name}
                              </div>
                              
                              <div style={{ width: '55%' }}>
                                <Progress percent={rate} strokeColor={color} status={status} strokeWidth={12} />
                              </div>
                              
                              <div style={{ width: '25%', textAlign: 'right' }}>
                                {slackersCount > 0 ? (
                                  <Tag color="error" style={{ fontSize: '15px', padding: '6px 16px', borderRadius: '16px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444' }}>
                                    未完成 {slackersCount} 人
                                  </Tag>
                                ) : (
                                  <Tag color="success" style={{ fontSize: '15px', padding: '6px 16px', borderRadius: '16px', border: 'none', backgroundColor: '#dcfce7', color: '#22c55e' }}>
                                    全员完成 🎉
                                  </Tag>
                                )}
                              </div>

                            </div>
                          </List.Item>
                        );
                      }}
                    />
                ) : (
                    <Empty description="昨日无作业数据" style={{ marginTop: 60, marginBottom: 60 }} />
                )}
              </Card>
            </Col>
          </Row>

          {/* ==================== 🌟 核心改造：高频易错词汇大榜 ==================== */}
          <Row style={{ marginTop: 24 }}>
             <Col span={24}>
              <Card 
                title={<><AlertOutlined style={{ color: '#f59e0b' }}/> 昨日高频易错词汇 (建议重点讲解)</>} 
                bordered={false} 
                className="custom-card alert-card"
              >
                <List
                  className="alert-list"
                  dataSource={stats.hardWords}
                  locale={{ emptyText: <Empty description="太棒了！昨天大家都没有背错单词！" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                  renderItem={(item: any, index: number) => (
                    <List.Item actions={[<Button type="dashed" size="small">一键加入复习任务</Button>]}>
                      <List.Item.Meta 
                        avatar={
                          <Avatar 
                            style={{ 
                              backgroundColor: index < 3 ? '#fee2e2' : '#fef3c7', 
                              color: index < 3 ? '#ef4444' : '#d97706',
                              fontWeight: 'bold'
                            }} 
                          >
                            TOP {index + 1}
                          </Avatar>
                        } 
                        title={<Text strong style={{ fontSize: '18px', color: '#1e293b' }}>{item.word}</Text>} 
                        description={
                          <Text type="danger" style={{ fontSize: '14px' }}>
                            全班共有 <Text strong style={{ fontSize: '16px', color: '#ef4444' }}>{item.count}</Text> 名学生记不住这个单词
                          </Text>
                        } 
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* 抓人弹窗 */}
          <Modal
            title={<><AlertOutlined style={{ color: '#ef4444', marginRight: 8 }} /> {modalData.className} - 昨日未通关名单</>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
              <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>
                我知道了
              </Button>
            ]}
          >
            <div style={{ padding: '20px 0' }}>
              {modalData.slackers.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {modalData.slackers.map((s: any) => (
                    <Tag 
                      key={s.id} 
                      color="error" 
                      style={{ padding: '6px 16px', fontSize: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444' }}
                    >
                      {s.name} <Text type="danger" style={{ fontSize: '13px', marginLeft: 4 }}>({s.progress}%)</Text>
                    </Tag>
                  ))}
                </div>
              ) : (
                <Result
                  status="success"
                  title="太棒了！"
                  subTitle="昨天该班级所有收到作业的学生，均已 100% 完美通关！"
                />
              )}
            </div>
          </Modal>

        </div>
    )
}