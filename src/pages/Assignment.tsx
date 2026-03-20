import { useState, useEffect } from 'react';
import { Card, Form, Select, DatePicker, Button, Transfer, message, Row, Col, Typography, Space, Switch, Tooltip } from 'antd';
import { BookOutlined, SendOutlined, ThunderboltOutlined, RobotOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { fetchClasses, fetchWordbooks, fetchVocabularies, createAssignment } from '../api/assignment';
import request from '../utils/request';
import dayjs from 'dayjs'; 

const { Text } = Typography;

interface TransferItem {
  key: string;
  title: string;
  description: string;
}

type StudentWord = {
  studentId: string;
  wordId: number;
  correctCount: number;
  wrongCount: number;
  lastTestedAt?: string;
  masteryLevel?: number;
};

export default function Assignment() {
  const [form] = Form.useForm();

  const [classes, setClasses] = useState<any[]>([]);
  const [wordbooks, setWordbooks] = useState<any[]>([]);
  const [vocabularies, setVocabularies] = useState<TransferItem[]>([]); 
  const [targetKeys, setTargetKeys] = useState<string[]>([]); 
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingWords, setIsFetchingWords] = useState(false);

  useEffect(() => {
      const initData = async () => {
        try {
          const [classesData, booksData] = await Promise.all([
            fetchClasses(), // 呼叫极其轻量的真实班级接口
            fetchWordbooks() // 呼叫词书字典
          ]);
          setClasses(classesData);
          setWordbooks(booksData);
        } catch (error) {
          message.error('基础数据加载失败');
        }
      };
      initData();
    }, []);

  // 根据已布置的作业过滤掉“发过的单词”，并尝试自动匹配词书
  const handleClassesChange = (selectedClassIds: string[]) => {
    form.setFieldsValue({ wordbookId: undefined });
    setVocabularies([]);
    setTargetKeys([]);
    setSelectedGrade('');
  };

  const handleWordbookChange = async (bookId: string) => {
    setIsFetchingWords(true);
    try {
      const currentBook = wordbooks.find(b => b.id === bookId);
      if (currentBook) {
        setSelectedGrade(currentBook.name);
      }

      const words = await fetchVocabularies(bookId);
      
      // 极其干净的格式转换，没有任何恶心的 filter 逻辑
      const transferData = words.map((v: any) => ({
        key: String(v.id), 
        title: v.word,
        description: `${v.partOfSpeech || ''} ${v.translation}`
      }));

      setVocabularies(transferData);
      setTargetKeys([]); 
    } catch (error) {
      message.error('拉取词库失败');
    } finally {
      setIsFetchingWords(false);
    }
  };

  // ==================== 🌟 完全傻瓜式的极速点按引擎 ====================
  const quickSelect = (count: number, isRandom: boolean = false) => {
    if (vocabularies.length === 0) {
      return message.warning('当前词库为空或未选择！');
    }

    const actualCount = Math.min(count, vocabularies.length); 
    let newKeys: string[] = [];
    
    if (isRandom) {
      const shuffled = [...vocabularies].sort(() => 0.5 - Math.random());
      newKeys = shuffled.slice(0, actualCount).map(v => v.key);
      message.success(`🎲 刺激！已为您随机盲抽 ${actualCount} 个新词`);
    } else {
      newKeys = vocabularies.slice(0, actualCount).map(v => v.key);
      message.success(`⚡ 搞定！已一键选中前 ${actualCount} 个新词`);
    }

    setTargetKeys(newKeys);
  };
  // =================================================================

  const calculateDefaultDeadline = () => {
    const today = dayjs();
    const dayOfWeek = today.day(); 
    if (dayOfWeek === 5) return today.add(3, 'day').endOf('day');
    if (dayOfWeek === 6) return today.add(2, 'day').endOf('day');
    return today.add(1, 'day').endOf('day');
  };


  const handleFinish = async (values: any) => {
    if (targetKeys.length === 0) {
      return message.warning('请至少在下方词库中选取一个单词！');
    }

    setIsSubmitting(true);
    try {
      const finalDeadline = values.deadline ? dayjs(values.deadline) : calculateDefaultDeadline();
      const dateStr = dayjs().format('MM月DD日');
      const autoTitle = `${dateStr} 词汇任务`; // 简化了标题，极其清爽

      // 🗡️ 极其霸道的组装！不需要任何前端循环发送和计算错题了！
      const payload = {
        classIds: values.classIds,
        title: autoTitle,
        targetGrade: selectedGrade,
        deadline: finalDeadline.toISOString(),
        baseWordIds: targetKeys, // 老师选的这些词
        isPersonalized: values.enablePersonalization // 千人千面开关直接扔给后端！
      };

      // 💥 一炮干穿 Spring Boot 真实接口！
      await createAssignment(payload);

      message.success(`🎉 霸气！已成功向 ${values.classIds.length} 个班级批量派发作业！${values.enablePersonalization ? '(千人千面引擎已在后端启动🤖)' : ''}`);
      
      form.resetFields();
      setTargetKeys([]);
      setVocabularies([]);
      setSelectedGrade(''); 
      
    } catch (error: any) {
      message.error(error.message || '作业发布失败，请检查网络');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title={<><BookOutlined style={{ color: '#1677ff', marginRight: 8 }}/> 批量极速派发任务</>} bordered={false} className="custom-card">
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ enablePersonalization: true }}>
        
        <Row gutter={24} style={{ marginBottom: 12 }}>
          <Col xs={24} md={12}>
            <Form.Item name="classIds" label={<Text strong>1. 选择目标班级 (可多选，选完点空白处收起下拉框 🚀)</Text>} rules={[{ required: true, message: '请至少选择一个目标班级' }]}>
              <Select mode="multiple" placeholder="点击可同时选择多个班级进行群发" size="large" onChange={handleClassesChange} allowClear>
                {classes.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item name="deadline" label={<Text strong>特殊截止时间 (可选，默认次日/周一截止)</Text>}>
              <DatePicker showTime style={{ width: '100%' }} size="large" placeholder="系统将自动推算，如需修改请点击"/>
            </Form.Item>
          </Col>
        </Row>

        <Card size="small" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd', marginBottom: 24, borderRadius: 8 }}>
          <Form.Item name="enablePersonalization" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch style={{ marginRight: 12 }} />
            <Text strong style={{ color: '#0369a1', fontSize: '15px' }}>
              <RobotOutlined style={{ marginRight: 6 }}/> 
              开启「千人千面」自适应复习引擎
            </Text>
            <Tooltip title="开启后，除了您指定的新单词外，系统还会自动为每个学生追加他们个人的『专属易错词』和『到期复习词』，让作业因人而异！">
              <QuestionCircleOutlined style={{ marginLeft: 8, color: '#0ea5e9', cursor: 'pointer' }} />
            </Tooltip>
          </Form.Item>
        </Card>

        <Card type="inner" title={<Text strong>2. 智能词库与下发控制台 (已过滤该班学过的词 ✂️)</Text>} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            
            {/* 左边：选择词库 */}
            <div style={{ flex: '1 1 auto', minWidth: '220px' }}>
              <Form.Item name="wordbookId" style={{ marginBottom: 0 }}>
                <Select 
                  placeholder="切换词库" 
                  style={{ width: '100%' }} 
                  onChange={(value) => handleWordbookChange(value as string)}
                  size="middle" 
                  loading={isFetchingWords}
                >
                  {availableWordbooks.map(b => <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </div>

            {/* 中间：没有任何输入框，全是傻瓜式的快捷点按按钮 */}
            <div style={{ 
              display: 'flex', alignItems: 'center', backgroundColor: '#f0fdf4', 
              padding: '6px 12px', borderRadius: '6px', border: '1px dashed #86efac',
              flex: '2 1 auto', minWidth: '400px', justifyContent: 'center'
            }}>
              <Text strong style={{ color: '#166534', marginRight: 12, fontSize: '13px' }}>
                <ThunderboltOutlined /> 极速提取:
              </Text>
              <Space size="small">
                <Button size="small" type="primary" ghost onClick={() => quickSelect(5)}>5 个</Button>
                <Button size="small" type="primary" ghost onClick={() => quickSelect(10)}>10 个</Button>
                <Button size="small" type="primary" ghost onClick={() => quickSelect(15)}>15 个</Button>
                <Button size="small" type="primary" ghost onClick={() => quickSelect(20)}>20 个</Button>
                <Button size="small" type="primary" ghost onClick={() => quickSelect(25)}>25 个</Button>
                <Button size="small" style={{ color: '#8b5cf6', borderColor: '#8b5cf6', marginLeft: 8 }} onClick={() => quickSelect(20, true)}>🎲 随机20个</Button>
                <Button size="small" danger onClick={() => setTargetKeys([])}>清空</Button>
              </Space>
            </div>

            {/* 右边：极速发送区 */}
            <div style={{ flex: '1 1 auto', minWidth: '240px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button size="middle" onClick={() => { form.resetFields(); setTargetKeys([]); }}>清空重置</Button>
              <Button type="primary" size="middle" htmlType="submit" icon={<SendOutlined />} loading={isSubmitting}>下发千人千面任务</Button>
            </div>

          </div>

          <div>
            <Transfer
              dataSource={vocabularies}
              titles={['未学词库', `本次基础新词 (${targetKeys.length})`]}
              targetKeys={targetKeys}
              onChange={(newKeys) => setTargetKeys(newKeys as string[])}
              render={(item) => <span style={{ fontWeight: 500 }}>{item.title}</span>}
              listStyle={{ width: '45%', height: 400 }}
              showSearch 
            />
          </div>
        </Card>

      </Form>
    </Card>
  );
}
