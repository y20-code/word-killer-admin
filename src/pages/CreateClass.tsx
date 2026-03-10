import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Form, Input, Select, Button, Space, Table, message, Result, Popconfirm,Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import request from '../utils/request';
import './CreateClass.scss'; // 你可以自己随便写点样式，主要是间距

const { Text } = Typography;


export default function CreateClass() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  
  // 🌟 核心状态管理
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 班级数据
  const [classForm] = Form.useForm();
  const [classInfo, setClassInfo] = useState({ name: '', grade: '' });
  
  // 学生名单数据 (系统默认给一行空数据)
  const [students, setStudents] = useState([
    { key: Date.now().toString(), fullName: '', studentId: `s_${Math.floor(1000 + Math.random() * 9000)}`, password: '123' }
  ]);

  // ==================== 🌟 第一步：校验班级信息 ====================
  const handleNextToStudents = async () => {
    try {
      const values = await classForm.validateFields();
      setClassInfo(values);
      setCurrentStep(1); // 进入第二步
    } catch (error) {
      // 校验失败，不往下走
    }
  };

  // ==================== 🌟 第二步：动态表格操作 ====================
  const handleAddStudentRow = () => {
    const newId = `s_${Math.floor(1000 + Math.random() * 9000)}`; // 模拟生成四位数随机学号
    setStudents([...students, { key: Date.now().toString(), fullName: '', studentId: newId, password: '123' }]);
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
    // 校验：有没有填空名字的学生？
    const invalidStudents = students.filter(s => !s.fullName.trim());
    if (invalidStudents.length > 0) {
      return message.error('请填写完整的学生姓名，或删除多余的空行！');
    }

    setIsSubmitting(true);
    try {
      // 1. 先创建班级
      const newClassPayload = {
        name: classInfo.name,
        teacherId: currentUser?.id,
        inviteCode: Math.random().toString(36).slice(-6).toUpperCase(), // 顺手生成一个邀请码兜底
        createdAt: new Date().toISOString()
      };
      const createdClass = await request.post('/classes', newClassPayload) as any;

      // 2. 拿到刚才建好的班级 ID，批量创建学生账号
      const studentPromises = students.map(stu => {
        return request.post('/users', {
          id: stu.studentId, // 强制指定学号为 ID
          role: 'student',
          fullName: stu.fullName,
          password: stu.password,
          classId: createdClass.id, // 🌟 核心：把这批学生死死绑在这个班级上！
          grade: classInfo.grade,
          createdAt: new Date().toISOString()
        });
      });

      await Promise.all(studentPromises); // 并发请求，瞬间录入

      message.success('班级与学生名册创建成功！');
      setCurrentStep(2); // 进入成功页
    } catch (error) {
      console.error(error);
      message.error('创建失败，请检查网络或服务器');
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
        <Input 
          placeholder="例如：李雷" 
          value={text} 
          onChange={(e) => handleStudentNameChange(e.target.value, record.key)} 
        />
      ),
    },
    {
      title: '系统分配学号',
      dataIndex: 'studentId',
      render: (id: string) => <Text code>{id}</Text>,
    },
    {
      title: '默认初始密码',
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
        {/* 顶部进度条 */}
        <Steps 
          current={currentStep} 
          style={{ marginBottom: 40, padding: '0 40px' }}
          items={[
            {
              title: '班级信息',
              description: '设置名称与年级',
            },
            {
              title: '录入名册',
              description: '系统自动生成学号',
            },
            {
              title: '完成',
              description: '一键开通账号',
            },
          ]}
        />

        {/* ================= 步骤 1：填班级 ================= */}
        {currentStep === 0 && (
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <Form form={classForm} layout="vertical">
              <Form.Item 
                label="班级名称" 
                name="name" 
                rules={[{ required: true, message: '请输入班级名称' }]}
              >
                <Input placeholder="例如：2026届 四级冲刺B班" size="large" />
              </Form.Item>
              <Form.Item 
                label="整体受众年级" 
                name="grade" 
                rules={[{ required: true, message: '请选择年级' }]}
              >
                <Select placeholder="请选择该班级主要面向的年级" size="large">
                  <Select.Option value="初一">初一</Select.Option>
                  <Select.Option value="初二">初二</Select.Option>
                  <Select.Option value="高一">高一</Select.Option>
                  <Select.Option value="高二">高二</Select.Option>
                </Select>
              </Form.Item>
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
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>班级：{classInfo.name}</span>
                <span style={{ marginLeft: 16, color: '#888' }}>当前录入：{students.length} 人</span>
              </div>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddStudentRow}>
                新增一行
              </Button>
            </div>

            <Table 
              dataSource={students} 
              columns={columns} 
              pagination={false} 
              size="middle"
              bordered
            />

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space size="large">
                <Button onClick={() => setCurrentStep(0)}>上一步</Button>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />} 
                  onClick={handleSubmitAll} 
                  loading={isSubmitting}
                >
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
            title="班级与学生账号全部创建成功！"
            subTitle={`成功为 ${classInfo.name} 开通了 ${students.length} 个学生账号。请将生成的学号与默认密码（123）分发给学生。`}
            extra={[
              <Button type="primary" key="console" onClick={() => navigate('/dashboard')}>
                返回数据大盘
              </Button>,
              <Button key="buy" onClick={() => {
                // 重置状态，再建一个
                classForm.resetFields();
                setStudents([{ key: Date.now().toString(), fullName: '', studentId: `s_${Math.floor(1000 + Math.random() * 9000)}`, password: '123' }]);
                setCurrentStep(0);
              }}>
                继续新建班级
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
}
