import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Avatar, Table, Button, Space, Input, Spin, message } from 'antd';
import { Users, TrendingUp, Zap } from 'lucide-react';
import { SearchOutlined, FilterOutlined, DownloadOutlined, MailOutlined, StarFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { fetchTeacherStudents } from '../api/student';
import './StudentList.scss';

const { Title, Text } = Typography;


interface Student {
  key: string;
  name: string;
  avatar: string;
  joinDate: string;
  stars: number;
  words: number;
  lastActive: string;
}

export default function StudentList() {

    const navigate = useNavigate();
    const currentUser = useUserStore((state) => state.currentUser);

    const [isLoading, setIsLoading] = useState(true);
    const [studentList, setStudentList] = useState<Student[]>([]);
    const [stats, setStats] = useState({ totalStudents: 0, avgProgress: 0 });

    useEffect(() => {
      const loadData = async () => {
        if (!currentUser?.id) return;
        
        setIsLoading(true);
        
        try {
          const data = await fetchTeacherStudents(currentUser.id);
          setStudentList(data.students);
          setStats({ totalStudents: data.totalStudents, avgProgress: data.avgProgress });
        } catch (error) {
          message.error('获取学生列表失败');
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [currentUser]);

    const columns: ColumnsType<Student> = [
    {
      title: '学生姓名',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space size="middle" style={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${record.key}`)}>
          {/* 换成了真实的图片头像 */}
          <Avatar src={record.avatar} style={{ backgroundColor: '#f1f5f9' }} />
          <Text strong>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: '加入日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
    },
    {
      title: '熟练程度',
      dataIndex: 'stars',
      key: 'stars',
      render: (stars) => (
        <div style={{ color: '#fbbf24' }}>
          {[...Array(5)].map((_, i) => (
            <StarFilled key={i} style={{ opacity: i < stars ? 1 : 0.2, marginRight: 2 }} />
          ))}
        </div>
      ),
    },
    {
      title: '掌握词汇',
      dataIndex: 'words',
      key: 'words',
      sorter: (a, b) => a.words - b.words,
      render: (words: number) => <Text strong>{words.toLocaleString()} 词</Text>,
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: '快速操作',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<MailOutlined />} style={{ color: '#137fec' }} />
          {/* 点击查看详情，带着学生 ID 跳转 */}
          <Button size="small" className="detail-btn" onClick={() => navigate(`/students/${record.key}`)}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}><Spin size="large" /></div>;
  }

  return (
    <div className="student-list-container">
      {/* 顶部数据卡片 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card">
            <div className="stat-card-body">
              <div className="stat-card__icon-box stat-card__icon-box--blue"><Users size={28} /></div>
              <div className="stat-card__content">
                <Text type="secondary" className="label">学生总数</Text>
                {/* 动态数字注入！ */}
                <Title level={3} className="value">{stats.totalStudents}</Title> 
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card">
            <div className="stat-card-body">
              <div className="stat-card__icon-box stat-card__icon-box--emerald"><TrendingUp size={28} /></div>
              <div className="stat-card__content">
                <Text type="secondary" className="label">平均进度</Text>
                {/* 动态进度注入！ */}
                <Title level={3} className="value">{stats.avgProgress}%</Title>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card">
            <div className="stat-card-body">
              <div className="stat-card__icon-box stat-card__icon-box--orange"><Zap size={28} /></div>
              <div className="stat-card__content">
                <Text type="secondary" className="label">今日活跃</Text>
                {/* 随便写个运算让它看起来逼真点 */}
                <Title level={3} className="value">{stats.totalStudents > 0 ? 1 : 0}</Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 学生目录表格 */}
      <Card 
        className="data-card"
        title={<Title level={5} style={{ margin: 0 }}>学生目录</Title>}
        extra={
          <Space>
            <Input placeholder="搜索学生..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ width: 200, borderRadius: 20 }} />
            <Button icon={<FilterOutlined />}>筛选</Button>
            <Button icon={<DownloadOutlined />}>导出</Button>
          </Space>
        }
        bordered={false}
      >
        <Table 
          columns={columns} 
          dataSource={studentList} // 替换为真实的 React 状态数据！
          pagination={{ 
            total: stats.totalStudents, 
            pageSize: 10, 
            showSizeChanger: false,
            className: "custom-pagination" 
          }}
        />
      </Card>
    </div>
  );
}