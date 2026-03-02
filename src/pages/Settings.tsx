import { Card, Form, Input, Select, Switch, Button, Row, Col, Avatar, Typography } from 'antd';
import { User, Shield, BellRing, SlidersHorizontal, Globe, Camera, Save } from 'lucide-react';
import './Settings.scss';

const { TextArea } = Input;
const { Text } = Typography;

export default function Settings() {
  const [form] = Form.useForm();

  // 模拟保存操作
  const handleSave = (values: any) => {
    console.log('保存的设置数据:', values);
    alert('✅ 更改已保存！(请查看控制台日志)');
  };

  return (
    <div className="settings-container">
      {/* 🏆 大厂标准：使用 Form 组件包裹整个设置页面 */}
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSave}
        initialValues={{
          fullName: '汉德森教授',
          title: '高级英语组组长',
          education: '剑桥大学应用语言学硕士，TESOL 认证专家。',
          gradeScale: 'percent',
          viewMode: 'card',
          language: 'zh-CN',
          emailNotif: true,
          pushNotif: true,
          twoFactor: false
        }}
      >
        
        {/* 1. 个人资料 */}
        <Card 
          className="settings-card" 
          bordered={false}
          title={<><User size={20} color="#137fec" /> 个人资料</>}
        >
          <Row gutter={32}>
            <Col xs={24} md={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="avatar-uploader">
                <Avatar size={96} src="https://picsum.photos/seed/henderson/100/100" />
                <div className="camera-btn">
                  <Camera size={16} />
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 12 }}>支持 JPG, PNG, GIF</Text>
            </Col>
            
            <Col xs={24} md={18}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="全名" name="fullName" rules={[{ required: true, message: '全名不能为空' }]}>
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="教学头衔" name="title">
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="教育背景 / 证书" name="education">
                <TextArea rows={3} placeholder="输入您的教育背景或教学资质..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 2. 账号安全 */}
        <Card 
          className="settings-card" 
          bordered={false}
          title={<><Shield size={20} color="#137fec" /> 账号安全</>}
        >
          <div className="setting-list-item">
            <div className="info">
              <h4>修改密码</h4>
              <p>为了您的账号安全，建议定期更改密码</p>
            </div>
            <Button>修改密码</Button>
          </div>
          <div className="setting-list-item">
            <div className="info">
              <h4>双重身份验证 (2FA)</h4>
              <p>通过手机验证码增加额外的安全保护</p>
            </div>
            {/* 使用 Form.Item 绑定 Switch 状态 */}
            <Form.Item name="twoFactor" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </Card>

        {/* 3. 通知设置 */}
        <Card 
          className="settings-card" 
          bordered={false}
          title={<><BellRing size={20} color="#137fec" /> 通知设置</>}
        >
          <div className="setting-list-item">
            <div className="info">
              <h4>邮件通知</h4>
              <p>接收关于学生进度和每周摘要的邮件</p>
            </div>
            <Form.Item name="emailNotif" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
          <div className="setting-list-item">
            <div className="info">
              <h4>推送通知</h4>
              <p>实时接收作业提交和截止日期提醒</p>
            </div>
            <Form.Item name="pushNotif" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </Card>

        {/* 4. 底部网格并排：班级偏好 & 偏好语言 */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card 
              className="settings-card" 
              bordered={false} style={{ height: '100%' }}
              title={<><SlidersHorizontal size={20} color="#137fec" /> 班级偏好</>}
            >
              <Form.Item label="默认评分标准" name="gradeScale">
                <Select size="large">
                  <Select.Option value="percent">百分制 (0-100)</Select.Option>
                  <Select.Option value="letter">等级制 (A-F)</Select.Option>
                  <Select.Option value="gpa">四分制 (GPA)</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="默认显示视图" name="viewMode" style={{ marginBottom: 0 }}>
                <Select size="large">
                  <Select.Option value="card">卡片视图</Select.Option>
                  <Select.Option value="list">列表视图</Select.Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              className="settings-card" 
              bordered={false} style={{ height: '100%' }}
              title={<><Globe size={20} color="#137fec" /> 偏好语言</>}
            >
              <Form.Item label="界面显示语言" name="language">
                <Select size="large">
                  <Select.Option value="zh-CN">简体中文 (Chinese Simplified)</Select.Option>
                  <Select.Option value="en-US">English (US)</Select.Option>
                  <Select.Option value="ja-JP">日本語 (Japanese)</Select.Option>
                </Select>
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                语言设置将即时应用于所有导航和系统通知。
              </Text>
            </Card>
          </Col>
        </Row>

        {/* 5. 底部操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, marginBottom: 40 }}>
          <Button size="large" onClick={() => form.resetFields()}>重置</Button>
          {/* htmlType="submit" 会自动触发 Form 的 onFinish */}
          <Button type="primary" size="large" htmlType="submit" icon={<Save size={18} />}>
            保存更改
          </Button>
        </div>

      </Form>
    </div>
  );
}