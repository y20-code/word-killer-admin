import { useState, useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Transfer, message, Row, Col, Typography } from 'antd';
import { BookOutlined, SendOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { fetchClasses, fetchWordbooks, fetchVocabularies, createAssignment } from '../api/assignment';
// 如果没安装 dayjs，可以通过 npm install dayjs 安装，AntD v5 默认依赖
import dayjs from 'dayjs'; 

const { Title, Text } = Typography;

interface TransferItem {
  key: string;
  title: string;
  description: string;
}

export default function Assignment() {
  const [form] = Form.useForm();
  const currentUser = useUserStore((state) => state.currentUser);

  // 页面需要的数据源
  const [classes, setClasses] = useState<any[]>([]);
  const [wordbooks, setWordbooks] = useState<any[]>([]);
  const [vocabularies, setVocabularies] = useState<TransferItem[]>([]); // 穿梭框左侧的备选词
  const [targetKeys, setTargetKeys] = useState<string[]>([]); // 穿梭框右侧已选的单词 ID 数组
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingWords, setIsFetchingWords] = useState(false);

  // 初始化：获取班级和词书列表
  useEffect(() => {
    if (!currentUser?.id) return;
    const initData = async () => {
      try {
        const [classesData, booksData] = await Promise.all([
          fetchClasses(currentUser.id),
          fetchWordbooks()
        ]);
        setClasses(classesData);
        setWordbooks(booksData);
      } catch (error) {
        message.error('基础数据加载失败');
      }
    };
    initData();
  }, [currentUser]);

  // 当老师选择了某本词书时，去拉取这本词书的单词
  const handleWordbookChange = async (bookId: string) => {
    setIsFetchingWords(true);
    try {
      const words = await fetchVocabularies(bookId);
      // 🏆 核心：穿梭框要求的数据格式必须有 key
      const transferData = words.map((v: any) => ({
        key: v.id,
        title: v.word,
        description: v.translation
      }));
      setVocabularies(transferData);
      // 切换词书时，清空之前选的单词
      setTargetKeys([]); 
    } catch (error) {
      message.error('拉取词库失败');
    } finally {
      setIsFetchingWords(false);
    }
  };

  // 穿梭框发生移动时触发
  const handleTransferChange = (newTargetKeys: React.Key[]) => {
    setTargetKeys(newTargetKeys as string[]);
  };

  // 提交作业表单
  const handleFinish = async (values: any) => {
    if (targetKeys.length === 0) {
      return message.warning('请至少在词库中选择一个单词！');
    }

    setIsSubmitting(true);
    try {
      // 🏆 拼装我们在 Markdown 里设计的完美 JSON 结构
      const payload = {
        classId: values.classId,
        title: values.title,
        wordIds: targetKeys, // ["v_001", "v_002"] 极度节省空间！
        deadline: values.deadline.toISOString(), // 将时间转化为国际标准字符串
        createdAt: new Date().toISOString()
      };

      await createAssignment(payload);
      
      message.success('🎉 作业发布成功！学生的小程序端已同步更新。');
      // 重置表单和穿梭框
      form.resetFields();
      setTargetKeys([]);
      setVocabularies([]);
      
    } catch (error) {
      message.error('作业发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card 
      title={<><BookOutlined style={{ color: '#1677ff', marginRight: 8 }}/> 发布新词汇任务</>}
      bordered={false} 
      style={{ borderRadius: 12, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item name="title" label="任务标题" rules={[{ required: true, message: '请输入任务标题' }]}>
              <Input placeholder="例如：今日作业：四级高频词 Unit 1" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="classId" label="目标班级" rules={[{ required: true, message: '请选择目标班级' }]}>
              <Select placeholder="选择要布置给哪个班级" size="large">
                {classes.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="deadline" label="截止时间" rules={[{ required: true, message: '请选择截止时间' }]}>
              <DatePicker showTime style={{ width: '100%' }} size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Card type="inner" title="智能词库挑选" style={{ marginBottom: 24, backgroundColor: '#f8fafc' }}>
          <Form.Item label="1. 先选择词书来源">
            <Select 
              placeholder="选择词书库（如：四级核心词汇）" 
              style={{ width: 300 }} 
              onChange={handleWordbookChange}
              size="large"
            >
              {wordbooks.map(b => <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>)}
            </Select>
          </Form.Item>

          {/* 🏆 高大上的 AntD 穿梭框！ */}
          <div style={{ marginTop: 24 }}>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>2. 从词库挑选要下发的单词 ({targetKeys.length} 个已选)</Text>
            <Transfer
              dataSource={vocabularies}
              titles={['备选词库', '本次作业包含的单词']}
              targetKeys={targetKeys}
              onChange={handleTransferChange}
              render={(item) => <span style={{ fontWeight: 500 }}>{item.title} <Text type="secondary" style={{ fontSize: 12 }}>- {item.description}</Text></span>}
              listStyle={{
                width: '45%',
                height: 400,
              }}
              showSearch // 开启搜索功能
            />
          </div>
        </Card>

        <Form.Item style={{ textAlign: 'right', marginTop: 32 }}>
          <Button size="large" onClick={() => form.resetFields()} style={{ marginRight: 16 }}>
            清空重置
          </Button>
          <Button type="primary" size="large" htmlType="submit" icon={<SendOutlined />} loading={isSubmitting}>
            一键派发任务
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}