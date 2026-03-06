import { useState, useEffect } from 'react';
import { Card, Form, Select, DatePicker, Button, Transfer, message, Row, Col, Typography, Space, Switch, Tooltip } from 'antd';
import { BookOutlined, SendOutlined, ThunderboltOutlined, RobotOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { fetchClasses, fetchWordbooks, fetchVocabularies, createAssignment } from '../api/assignment';
import dayjs from 'dayjs'; 

const { Text } = Typography;

interface TransferItem {
  key: string;
  title: string;
  description: string;
}

export default function Assignment() {
  const [form] = Form.useForm();
  const currentUser = useUserStore((state) => state.currentUser);

  const [classes, setClasses] = useState<any[]>([]);
  const [wordbooks, setWordbooks] = useState<any[]>([]);
  const [availableWordbooks, setAvailableWordbooks] = useState<any[]>([]); 

  const [vocabularies, setVocabularies] = useState<TransferItem[]>([]); 
  const [targetKeys, setTargetKeys] = useState<string[]>([]); 
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  
  const [learnedWordIds, setLearnedWordIds] = useState<number[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingWords, setIsFetchingWords] = useState(false);

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
        setAvailableWordbooks(booksData); 
      } catch (error) {
        message.error('基础数据加载失败');
      }
    };
    initData();
  }, [currentUser]);

  const handleClassesChange = async (selectedClassIds: string[]) => {
    form.setFieldsValue({ wordbookId: undefined });
    setVocabularies([]);
    setTargetKeys([]);
    setSelectedGrade('');
    setLearnedWordIds([]);

    if (!selectedClassIds || selectedClassIds.length === 0) {
      setAvailableWordbooks(wordbooks);
      return;
    }

    setIsFetchingWords(true);
    try {
      const assignRes = await fetch('http://localhost:3002/assignments');
      const allAssignments = await assignRes.json();
      
      const usedIds = new Set<number>();
      allAssignments.forEach((a: any) => {
        if (selectedClassIds.includes(a.classId) && a.wordIds) {
          a.wordIds.forEach((id: number) => usedIds.add(id));
        }
      });
      setLearnedWordIds(Array.from(usedIds)); 

      let allDetectedGrades = new Set<string>(); 
      for (const classId of selectedClassIds) {
        const targetClass = classes.find(c => c.id === classId);
        const className = targetClass?.name || ''; 

        const possibleGrades = ['初一', '初二', '初三', '高一', '高二', '高三', '七年级', '八年级', '九年级', '四级', '六级', '考研'];
        let detectedGrade = possibleGrades.find(g => className.includes(g));

        if (!detectedGrade) {
          const res = await fetch(`http://localhost:3002/users?role=student&classId=${classId}`);
          const students = await res.json();
          const studentGrades = Array.from(new Set(students.map((s: any) => s.grade).filter(Boolean))) as string[];
          if (studentGrades.length === 1) detectedGrade = studentGrades[0];
        }

        if (detectedGrade) {
          let searchKeywords = [detectedGrade];
          if (detectedGrade === '初一') searchKeywords.push('七年级');
          if (detectedGrade === '初二') searchKeywords.push('八年级');
          if (detectedGrade === '初三') searchKeywords.push('九年级');
          searchKeywords.forEach(k => allDetectedGrades.add(k));
        }
      }

      const uniqueGrades = Array.from(allDetectedGrades);

      if (uniqueGrades.length === 0) {
        setAvailableWordbooks(wordbooks); 
        return;
      }

      const matchedBooks = wordbooks.filter(b => 
        uniqueGrades.some(keyword => b.name.includes(keyword))
      );
      setAvailableWordbooks(matchedBooks);

      if (matchedBooks.length === 1) {
        const autoBook = matchedBooks[0];
        form.setFieldsValue({ wordbookId: autoBook.id }); 
        
        if (usedIds.size > 0) {
          message.success(`已加载【${autoBook.name}】词库，并智能排除了 ${usedIds.size} 个已学单词！`);
        } else {
          message.success(`已为选中的班级自动加载【${autoBook.name}】专属词库！`);
        }
        handleWordbookChange(autoBook.id); 
      }
    } catch (error) {
      console.error(error);
      message.error('班级数据分析失败');
    } finally {
      setIsFetchingWords(false);
    }
  };

  const handleWordbookChange = async (bookId: string) => {
    setIsFetchingWords(true);
    try {
      const currentBook = wordbooks.find(b => b.id === bookId);
      if (currentBook) {
        setSelectedGrade(currentBook.name);
      }

      const words = await fetchVocabularies(bookId);
      
      const freshWords = words.filter((w: any) => !learnedWordIds.includes(w.id));

      const transferData = await Promise.all(freshWords.map(async (v: any) => {
        return {
          key: String(v.id), 
          title: v.word,
          description: `${v.partOfSpeech || ''} ${v.translation}`
        };
      }));

      setVocabularies(transferData);
      setTargetKeys([]); 
      
      if (freshWords.length === 0 && words.length > 0) {
        message.warning('太强了！该班级已经把这本词书的所有单词都学完了！🎉');
      }
    } catch (error) {
      message.error('拉取词库失败');
    } finally {
      setIsFetchingWords(false);
    }
  };

  // ==================== 🌟 完全傻瓜式的极速点按引擎 ====================
  const quickSelect = (count: number, isRandom: boolean = false) => {
    if (vocabularies.length === 0) {
      return message.warning('当前词库已被学完或未选择！');
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

      const promises = values.classIds.map((classId: string) => {
        const targetClass = classes.find(c => c.id === classId);
        const className = targetClass ? targetClass.name : '未知班级';
        const autoTitle = `${className} ${dateStr} 词汇任务`;

        const payload = {
          classId: classId,
          targetGrade: selectedGrade, 
          title: autoTitle, 
          wordIds: targetKeys.map(Number), 
          deadline: finalDeadline.toISOString(), 
          isPersonalized: values.enablePersonalization, 
          createdAt: new Date().toISOString()
        };

        return createAssignment(payload); 
      });

      await Promise.all(promises);
      
      message.success(`🎉 霸气！已成功向 ${values.classIds.length} 个班级批量派发作业！${values.enablePersonalization ? '(千人千面引擎已启动🤖)' : ''}`);
      
      form.resetFields();
      setTargetKeys([]);
      setVocabularies([]);
      setSelectedGrade(''); 
      setAvailableWordbooks(wordbooks); 
      setLearnedWordIds([]);
      
    } catch (error) {
      message.error('作业批量发布失败，请重试');
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
                <Select placeholder="切换词库" style={{ width: '100%' }} onChange={handleWordbookChange} size="middle" loading={isFetchingWords}>
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