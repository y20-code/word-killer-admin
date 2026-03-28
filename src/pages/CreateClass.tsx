import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Form, Input, Select, Button, Space, Table, message, Result, Popconfirm,Typography,Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { fetchMyClasses, createNewClass } from '../api/class';
import { batchCreateStudents } from '../api/user';
import './CreateClass.scss'; 

const { Text } = Typography;


export default function CreateClass() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  
  // 🌟 核心状态管理
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const [classMode, setClassMode] = useState<'new' | 'existing'>('new');
  const [myClasses, setMyClasses] = useState<any[]>([]);

  // 班级数据
  const [classForm] = Form.useForm();
  const [classInfo, setClassInfo] = useState({ name: '', grade: '', classId: '' });
  
  // 学生名单数据 (系统默认给一行空数据)
  const [students, setStudents] = useState([
    // 🌟 为了对接你的 MySQL，我把 studentId 映射为未来小程序的登录账号
    { key: Date.now().toString(), fullName: '', loginAccount: `s${Math.floor(10000 + Math.random() * 90000)}`, password: '123' }
  ]);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await fetchMyClasses(); // 💥 直接呼叫封装好的引擎
        setMyClasses(data);
      } catch (error) {
        console.error("历史班级拉取失败");
      }
    };
    if (currentUser) loadClasses();
  }, [currentUser]);

  // ==================== 🌟 第一步：校验班级信息 ====================
  const handleNextToStudents = async () => {
    try {
      const values = await classForm.validateFields();
      setClassInfo(values);
      setCurrentStep(1); 
    } catch (error) {
      // 校验失败
    }
  };

  // ==================== 🌟 第二步：动态表格操作 ====================
  const handleAddStudentRow = () => {
    const newId = `s${Math.floor(10000 + Math.random() * 90000)}`; // 换成 5 位数小程序账号
    // 💥 注意：这里把 studentId 彻底改成了 loginAccount
    setStudents([...students, { key: Date.now().toString(), fullName: '', loginAccount: newId, password: '123' }]);
  };

  const handleRemoveStudent = (key: string) => {
    if (students.length === 1) {
      return message.warning('至少要保留一个学生名额哦');
    }
    setStudents(students.filter(s => s.key !== key));
  };

  const handleStudentNameChange = (val: string, key: string) => {
    const newData = students.map(s => {
      if (s.key === key) return { ...s, fullName: val };
      return s;
    });
    setStudents(newData);
  };

  // ==================== 🌟 终极提交：落库到 db.json ====================
  const handleSubmitAll = async () => {
    const invalidStudents = students.filter(s => !s.fullName.trim());
    if (invalidStudents.length > 0) return message.error('请填写完整的学生姓名，或删除多余的空行！');

    setIsSubmitting(true);
    try {
      let finalClassId = classInfo.classId; // 如果选了老班级，这里就有值

      // 1. 如果是“新建模式”，呼叫 api/class.ts 里的接口建班
      if (classMode === 'new') {
        const createdClass = await createNewClass({
          name: classInfo.name,
          currentGrade: classInfo.grade,
        });
        finalClassId = createdClass.id; // 拿到热乎的新班级 ID
      }

      // 2. 极其暴力地组装学生 Payload
      const studentsPayload = students.map(stu => ({
        loginAccount: stu.loginAccount, // 对应 MySQL 表
        password: stu.password,
        fullName: stu.fullName,
        role: 'student',
        classId: finalClassId,          // 🌟 死死绑在最终确定的班级上！
        grade: classInfo.grade || '未知'
      }));

      // 3. 呼叫 api/user.ts 里的批量插入接口
      await batchCreateStudents(studentsPayload);

      message.success('学生名册录入成功，已可用于小程序登录！');
      setCurrentStep(2); 
    } catch (error: any) {
      console.error(error);
      message.error(error.message || '录入失败，请检查网络或后端');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== 🌟 UI 渲染模块 ====================
  const columns = [
    {
      title: '学生姓名 (必填)',
      dataIndex: 'fullName',
      render: (text: string, record: any) => (
        <Input placeholder="例如：李雷" value={text} onChange={(e) => handleStudentNameChange(e.target.value, record.key)} />
      ),
    },
    {
      title: '小程序登录账号',
      dataIndex: 'loginAccount', // 💥 改成 loginAccount
      render: (id: string) => <Text code>{id}</Text>,
    },
    {
      title: '初始密码',
      dataIndex: 'password',
      render: (pwd: string) => <Text type="secondary">{pwd}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm title="确定删除这行吗？" onConfirm={() => handleRemoveStudent(record.key)}>
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Card bordered={false} className="custom-card">
        <Steps 
          current={currentStep} 
          style={{ marginBottom: 40, padding: '0 40px' }}
          items={[
            { title: '班级信息', description: '选择或新建班级' },
            { title: '录入名册', description: '生成小程序账号' },
            { title: '完成', description: '一键开通账号' },
          ]}
        />

        {/* ================= 步骤 1：极其优雅的双模表单 ================= */}
        {currentStep === 0 && (
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            
            {/* 🌟 核心突破：新老班级切换开关 */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Radio.Group 
                value={classMode} 
                onChange={(e) => setClassMode(e.target.value)} 
                buttonStyle="solid"
              >
                <Radio.Button value="new">🌟 创建新班级</Radio.Button>
                <Radio.Button value="existing">📚 添加到已有班级</Radio.Button>
              </Radio.Group>
            </div>

            <Form form={classForm} layout="vertical">
              {classMode === 'new' ? (
                <>
                  <Form.Item label="新班级名称" name="name" rules={[{ required: true, message: '请输入班级名称' }]}>
                    <Input placeholder="例如：2026届 四级冲刺B班" size="large" />
                  </Form.Item>
                  <Form.Item label="受众年级" name="grade" rules={[{ required: true, message: '请选择年级' }]}>
                    <Select placeholder="请选择" size="large">
                      {['初一', '初二', '高一', '高二'].map(g => <Select.Option key={g} value={g}>{g}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </>
              ) : (
                <Form.Item label="选择已有班级" name="classId" rules={[{ required: true, message: '请选择要添加学生的班级' }]}>
                  <Select placeholder="请选择您的历史班级" size="large">
                    {myClasses.map(c => (
                      <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              
              <Button type="primary" size="large" block onClick={handleNextToStudents}>
                下一步：录入学生名册
              </Button>
            </Form>
          </div>
        )}

        {/* ================= 步骤 2：填名册 ================= */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                  目标班级：{classMode === 'new' ? classInfo.name : myClasses.find(c => c.id === classInfo.classId)?.name}
                </span>
                <span style={{ marginLeft: 16, color: '#888' }}>当前录入：{students.length} 人</span>
              </div>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddStudentRow}>新增一行</Button>
            </div>

            <Table dataSource={students} columns={columns} pagination={false} size="middle" bordered />

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space size="large">
                <Button onClick={() => setCurrentStep(0)}>上一步</Button>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSubmitAll} loading={isSubmitting}>
                  确认无误，开通全体账号
                </Button>
              </Space>
            </div>
          </div>
        )}

        {/* ================= 步骤 3：成功页 ================= */}
        {currentStep === 2 && (
          <Result
            status="success"
            title="学生账号批量开通成功！"
            subTitle={`已成功开通 ${students.length} 个学生账号。请将生成的登录账号与初始密码（123）分发给学生用于登录微信小程序。`}
            extra={[
              <Button type="primary" key="console" onClick={() => navigate('/dashboard')}>返回数据大盘</Button>,
              <Button key="buy" onClick={() => {
                classForm.resetFields();
                setStudents([{ key: Date.now().toString(), fullName: '', loginAccount: `s${Math.floor(10000 + Math.random() * 90000)}`, password: '123' }]);
                setCurrentStep(0);
              }}>继续添加学生</Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
}
