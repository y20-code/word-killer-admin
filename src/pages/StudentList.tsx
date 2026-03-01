import { Card, Row, Col, Typography, Avatar, Table, Tag, Progress, Button, Space, Input } from 'antd';
import { Users, TrendingUp, Zap } from 'lucide-react';
import { SearchOutlined, FilterOutlined, DownloadOutlined, MailOutlined, StarFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './StudentList.scss';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;


interface Student {
  key: string;
  initials: string;
  name: string;
  joinDate: string;
  stars: number;
  words: number;
  progress: number;
  lastActive: string;
  colorTheme: string;
}

const MOCK_STUDENTS: Student[] = [
  { key: '1', initials: 'JD', name: 'Julianne Davies', joinDate: '2023-09-12', stars: 5, words: 1420, progress: 85, lastActive: '2小时前', colorTheme: '#137fec' },
  { key: '2', initials: 'MK', name: 'Marcus Knight', joinDate: '2023-10-05', stars: 4, words: 892, progress: 45, lastActive: '昨天', colorTheme: '#10b981' },
  { key: '3', initials: 'SW', name: 'Sarah Williams', joinDate: '2023-11-18', stars: 2, words: 314, progress: 15, lastActive: '5分钟前', colorTheme: '#f59e0b' },
  { key: '4', initials: 'TL', name: 'Thomas Lee', joinDate: '2023-12-01', stars: 3, words: 756, progress: 40, lastActive: '3天前', colorTheme: '#64748b' },
];

export default function StudentList() {

    const navigate = useNavigate();

    const columns: ColumnsType<Student> = [
    {
      title: '学生姓名',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space 
            size="middle"
            style={{ cursor: 'pointer' }} 
          onClick={() => navigate(`/students/${record.key}`)}
        >
          <Avatar style={{ backgroundColor: record.colorTheme }}>{record.initials}</Avatar>
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
        dataIndex: 'words', // 必须指定 dataIndex，text 才会拿到数值
        key: 'words',
        sorter: (a, b) => a.words - b.words,
        render: (words: number) => (
            <div style={{ width: 120 }}>
            <Text strong>{words.toLocaleString()}</Text>
            {/* 这里的 record.progress 还是需要从第二个参数拿 */}
            </div>
        ),
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
      render: () => (
        <Space size="small">
          <Button type="text" icon={<MailOutlined />} style={{ color: '#137fec' }} />
          <Button size="small" className="detail-btn">查看详情</Button>
        </Space>
      ),
    },
  ];

  return (
<div className="student-list-container">
      
      {/* 1. 顶部数据卡片 (结合 SCSS 和 Antd) */}
      <Row gutter={[24, 24]}>
        {/* 第一块：学生总数 */}
        <Col xs={24} sm={8}>
            <Card bordered={false} className="stat-card">
            <div className="stat-card-body">
                <div className="stat-card__icon-box stat-card__icon-box--blue">
                <Users size={28} />
                </div>
                <div className="stat-card__content">
                <Text type="secondary" className="label">学生总数</Text>
                <Title level={3} className="value">124</Title>
                </div>
            </div>
            </Card>
        </Col>

        {/* 第二块：平均进度 */}
        <Col xs={24} sm={8}>
            <Card bordered={false} className="stat-card">
            <div className="stat-card-body">
                <div className="stat-card__icon-box stat-card__icon-box--emerald">
                <TrendingUp size={28} />
                </div>
                <div className="stat-card__content">
                <Text type="secondary" className="label">平均进度</Text>
                <Title level={3} className="value">68%</Title>
                </div>
            </div>
            </Card>
        </Col>

        {/* 第三块：今日活跃 */}
        <Col xs={24} sm={8}>
            <Card bordered={false} className="stat-card">
            <div className="stat-card-body">
                <div className="stat-card__icon-box stat-card__icon-box--orange">
                <Zap size={28} />
                </div>
                <div className="stat-card__content">
                <Text type="secondary" className="label">今日活跃</Text>
                <Title level={3} className="value">42</Title>
                </div>
            </div>
            </Card>
        </Col>
        </Row>

      {/* 2. 学生目录表格 (Antd Table) */}
      <Card 
        className="data-card"
        title={<Title level={5} style={{ margin: 0 }}>学生目录</Title>}
        extra={
          <Space>
            <Input 
              placeholder="搜索学生..." 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
              style={{ width: 200, borderRadius: 20 }}
            />
            <Button icon={<FilterOutlined />}>筛选</Button>
            <Button icon={<DownloadOutlined />}>导出</Button>
          </Space>
        }
        bordered={false}
      >
        <Table 
          columns={columns} 
          dataSource={MOCK_STUDENTS} 
          pagination={{ 
            total: 124, 
            pageSize: 4, 
            showSizeChanger: false,
            className: "custom-pagination" 
          }}
        />
      </Card>

    </div>
  );
}