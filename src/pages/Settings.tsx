import { useEffect, useState,useRef } from 'react';
import { Card, Form, Input, Select, Switch, Button, Row, Col, Avatar, Typography,message } from 'antd';
import { User, Shield, BellRing, SlidersHorizontal, Globe, Camera, Save } from 'lucide-react';
import './Settings.scss';
import { updateUser } from '../api/auth';
import { useUserStore } from '../store/userStore';

const { TextArea } = Input;
const { Text } = Typography;

export default function Settings() {
    const [form] = Form.useForm();
    const currentUser = useUserStore((state) => state.currentUser);
    const setCurrentUser = useUserStore((state) => state.setCurrentUser);
    const [currentAvatar, setCurrentAvatar] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 🏆 大厂逻辑：优先信任 Zustand 内存里的 currentUser，再去查 localStorage
    const user = currentUser || JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (user && user.email) { // 确保 user 是有效数据
      // 获取头像（优先读取数据库存的 customAvatar）
      const defaultAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`;
      setCurrentAvatar(user.customAvatar || defaultAvatar);

      // 把数据同步给表单
      form.setFieldsValue({
        fullName: user.fullName || '',
        title: user.title || '',           
        education: user.education || '',   
        gradeScale: user.gradeScale || 'percent',
        viewMode: user.viewMode || 'card',
        language: user.language || 'zh-CN',
        emailNotif: user.emailNotif ?? true, 
        pushNotif: user.pushNotif ?? true,
        twoFactor: user.twoFactor ?? false
      });
    }
  }, [currentUser, form]);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制一下图片大小，超过 2MB 拒绝（大厂标配防御）
    if (file.size > 100 * 1024) {
      return message.error('图片大小不能超过 100k b！');1
    }

    // 使用 FileReader 将图片转为 Base64 字符串
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCurrentAvatar(base64String); // 瞬间更新页面上的头像预览
      message.success('本地图片已加载，请点击底部的"保存更改"应用设置！');
    };
    reader.readAsDataURL(file); // 触发读取
  };

  // 模拟保存操作
  const handleSave = async (values: any) => {
    if (!currentUser || !currentUser.id) {
        return message.error('用户状态异常，请重新登录！');
    }

    setIsSaving(true); // 开启按钮 loading 转圈圈
    
    try {

        const finalData = { ...values, customAvatar: currentAvatar }; 

        // 2. 只发送一次网络请求给后端！
        await updateUser(currentUser.id, finalData);

        // 3. 后端保存成功后，同步更新本地内存和 LocalStorage (🏆 注意这里必须合并 finalData！)
        const updatedUser = { ...currentUser, ...finalData };
        setCurrentUser(updatedUser); // 更新 React 状态

        // 4. 弹出成功的绿色提示框
        message.success('✅ 个人设置已成功保存！');
        
    } catch (error) {
        console.error("保存失败:", error);
        message.error('保存失败，请检查网络！');
    } finally {
        setIsSaving(false); // 无论成功失败，关闭 loading
    }
  };

  return (
    <div className="settings-container">
      {/* 🏆 大厂标准：使用 Form 组件包裹整个设置页面 */}
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSave}
      >
        
        {/* 1. 个人资料 */}
        <Card 
          className="settings-card" 
          bordered={false}
          title={<><User size={20} color="#137fec" /> 个人资料</>}
        >
          <Row gutter={32}>
            <Col xs={24} md={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/gif" 
                    style={{ display: 'none' }} 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                />
                <div className="avatar-uploader" onClick={triggerUpload} style={{ cursor: 'pointer' }}>
                    {/* 🏆 换成一模一样的真实头像，尺寸调大 */}
                    <Avatar size={96} src={currentAvatar} style={{ backgroundColor: '#f1f5f9' }} />
                    <div className="camera-btn">
                    <Camera size={16} />
                    </div>
                </div>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
                    {currentUser?.email} {/* 显示邮箱 */}
                </Text>
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
          <Button type="primary" size="large" htmlType="submit" icon={<Save size={18} /> } loading={isSaving}>
            保存更改
          </Button>
        </div>

      </Form>
    </div>
  );
}