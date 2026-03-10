import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Avatar, Button, List, Tag, Spin, message, Empty, Modal, Result, Progress } from 'antd';
import { 
  TeamOutlined, BookOutlined, BarChartOutlined, 
  AlertOutlined, PlusOutlined
} from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardData } from '../api/dashboard';
import StatCard from '../components/statCard'
import ClassProgressList from '../components/ClassProgressList';
import HardWordsCard from '../components/HardWordsCard';
import './Dashboard.scss';

const { Text } = Typography;

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
        if (!item.hasAssignment) {
            message.info('昨日未布置作业，无需查看名单');
            return;
        }
        setModalData({ className: item.name, slackers: item.slackers });
        setIsModalVisible(true);
    };

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" tip="正在生成数据大盘..." /></div>;
    }

    return (
        <div className="dashboard-container">
          <Row gutter={[24, 24]}>
            <StatCard icon={<TeamOutlined />} title={"活跃班级"} value={stats.activeClassCount} colorClass='avatar-blue'/>
            <StatCard icon={<BookOutlined/>} title={"作业记录"} value={stats.pendingAssignmentCount} colorClass='avatar-orange'/>
            <StatCard icon={<BarChartOutlined/>} title={"平均正确率"} value={stats.avgCorrectRate + '%'} colorClass='avatar-green'/>
          </Row>

          <Row style={{ marginTop: 24 }}>
            <ClassProgressList data={stats.chartData} onItemClick={onClassClick}/>
          </Row>

          {/* ==================== 🌟 核心改造：高频易错词汇大榜 ==================== */}
          <Row style={{ marginTop: 24 }}>
            <HardWordsCard data={stats.hardWords}/>
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
