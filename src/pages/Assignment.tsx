import { useState,useEffect } from 'react';
import { Button, Steps, Select, Input, Row, Col, DatePicker, TimePicker, Alert, Breadcrumb } from 'antd';
import { 
  Users, BookOpen, CalendarCheck, HelpCircle, Search, CheckCircle2, 
  Layers, SpellCheck, ListChecks, Send 
} from 'lucide-react';
import './Assignment.scss';

export default function Assignment() {
  // 🏆 状态管理：记录用户选中的内容
  const [selectedVocab, setSelectedVocab] = useState<string | null>('core');
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>('spell');

  // 词库 Mock 数据
  const vocabList = [
    { id: 'core', title: 'TOEFL 核心词汇', desc: '2,400 单词 · 12 单元', tag: 'Core', tagColor: 'blue' },
    { id: 'adv', title: 'GRE 进阶词库', desc: '3,500 单词 · 18 单元', tag: 'Advanced', tagColor: 'orange' },
    { id: 'acad', title: '学术写作高频词', desc: '800 单词 · 4 单元', tag: 'Academic', tagColor: 'purple' },
  ];

  // 任务类型 Mock 数据
  const taskTypes = [
    { id: 'flashcard', icon: <Layers size={32} />, title: '卡片复习', desc: '通过闪卡进行记忆强化，适合预习阶段' },
    { id: 'spell', icon: <SpellCheck size={32} />, title: '拼写测试', desc: '强制输入拼写，确保准确掌握拼写' },
    { id: 'choice', icon: <ListChecks size={32} />, title: '多项选择', desc: '通过释义选择单词，侧重词义辨析' },
  ];

  return (
    <div className="assignment-container">
      {/* 顶部面包屑与操作区 */}
      <div className="page-header">
        <div className="header-left">
          <h2>布置新作业</h2>
          <div className="divider" />
          <Breadcrumb items={[{ title: '作业中心' }, { title: <span style={{ color: '#137fec', fontWeight: 600 }}>创建任务</span> }]} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="text">取消创建</Button>
          <Button type="primary" style={{ fontWeight: 'bold' }}>保存草稿</Button>
        </div>
      </div>

      {/* 🏆 Ant Design 进度条：完美替代手写圆圈 */}
      <div style={{ padding: '0 40px', marginBottom: 40 }}>
        <Steps 
          current={1} // 假设当前进行到第 2 步 (索引为 1)
          items={[
            { title: '选择班级' },
            { title: '选择词库' },
            { title: '设置截止时间' },
            { title: '任务类型' },
          ]}
        />
      </div>

      {/* 第一步：选择班级 */}
      <div className="form-card">
        <div className="section-title">
          <div className="icon-box blue"><Users size={20} /></div>
          <h3>第一步：选择班级</h3>
        </div>
        <Row gutter={24} align="middle">
          <Col xs={24} md={12}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>选择授课班级</p>
            <Select 
              size="large" 
              defaultValue="classA" 
              style={{ width: '100%' }}
              options={[
                { value: 'classA', label: '英语 A 班 (高级班)' },
                { value: 'classB', label: '英语 B 班 (中级班)' },
                { value: 'classC', label: '英语 C 班 (基础班)' },
                { value: 'all', label: '全部班级' },
              ]}
            />
          </Col>
          <Col xs={24} md={12}>
            <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginTop: 24 }}>已选择班级共有 42 名学生将收到此任务</p>
          </Col>
        </Row>
      </div>

      {/* 第二步：选择词库 */}
      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            <div className="icon-box emerald"><BookOpen size={20} /></div>
            <h3>第二步：选择词库内容</h3>
          </div>
          <Input 
            placeholder="搜索词库或分类..." 
            prefix={<Search size={16} color="#94a3b8" />} 
            style={{ width: 250, borderRadius: 8 }} 
            size="large"
          />
        </div>
        <Row gutter={[16, 16]}>
          {vocabList.map(item => (
            <Col xs={24} md={8} key={item.id}>
              {/* 🏆 状态驱动的选中效果 */}
              <div 
                className={`vocab-card ${selectedVocab === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedVocab(item.id)}
              >
                {selectedVocab === item.id && <CheckCircle2 size={20} className="check-icon" />}
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#f1f5f9', color: '#64748b', textTransform: 'uppercase' }}>
                  {item.tag}
                </span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* 第三步：设置截止日期 */}
      <div className="form-card">
        <div className="section-title">
          <div className="icon-box orange"><CalendarCheck size={20} /></div>
          <h3>第三步：设置截止日期</h3>
        </div>
        <Row gutter={[32, 24]}>
          <Col xs={24} md={12}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>选择日期与时间</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {/* 🏆 强大的 Antd 日期与时间选择器 */}
              <DatePicker size="large" style={{ flex: 2 }} placeholder="选择日期" />
              <TimePicker size="large" style={{ flex: 1 }} format="HH:mm" placeholder="时间" />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Alert 
              message={<span style={{ fontWeight: 'bold' }}>注意：</span>}
              description="截止日期后提交的作业将被标记为“逾期”，您可以设置是否扣除部分积分。"
              type="warning" 
              showIcon 
              style={{ marginTop: 24, borderRadius: 12 }}
            />
          </Col>
        </Row>
      </div>

      {/* 第四步：任务类型 */}
      <div className="form-card">
        <div className="section-title">
          <div className="icon-box indigo"><HelpCircle size={20} /></div>
          <h3>第四步：任务类型</h3>
        </div>
        <Row gutter={[24, 24]}>
          {taskTypes.map(type => (
            <Col xs={24} md={8} key={type.id}>
              {/* 🏆 状态驱动的任务卡片 */}
              <div 
                className={`type-card ${selectedTaskType === type.id ? 'selected' : ''}`}
                onClick={() => setSelectedTaskType(type.id)}
              >
                <div className="icon-wrapper">{type.icon}</div>
                <h4>{type.title}</h4>
                <p>{type.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* 底部发布按钮 */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 40px' }}>
        <Button 
          type="primary" 
          size="large" 
          icon={<Send size={20} />} 
          style={{ height: 56, padding: '0 48px', fontSize: 18, borderRadius: 12, boxShadow: '0 8px 16px rgba(19,127,236,0.2)' }}
          onClick={() => alert(`🎉 发布成功！\n词库: ${selectedVocab}\n类型: ${selectedTaskType}`)}
        >
          立即发布作业
        </Button>
      </div>
    </div>
  );
}