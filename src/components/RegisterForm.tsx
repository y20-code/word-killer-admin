import { useState } from 'react';
import { UserPlus, Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { message } from 'antd';
import { registerUser, checkEmailExists } from '../api/auth';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) return message.error("两次输入的密码不一致！");

        if (!email) return message.error("请填写邮箱！");

        setIsLoading(true);

        try {
            // 1. 先查询邮箱是否已经被注册
            const existingUsers: any = await checkEmailExists(email);
            if (existingUsers.length > 0) {
                message.warning("该邮箱已被注册，请直接登录！");
                setIsLoading(false);
                return;
            }

            // 2. 组装要发送给后端的数据 (json-server 会自动生成 id)
            const newUser = {
                email,
                password, // 注意：实际开发中密码必须加密(MD5/SHA)，但在 json-server 模拟阶段存明文即可
                role: 'teacher', 
                createdAt: new Date().toISOString()
            };

            // 3. 发送 POST 请求写入 db.json
            await registerUser(newUser);

            message.success("🎉 注册成功！请使用新账号登录。");
            
            // 4. 清空表单并切换回登录页
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            onSwitchToLogin();

        } catch (error) {
            console.error(error);
            message.error("注册失败，请检查网络设置。");
        } finally {
            setIsLoading(false); // 关闭加载状态
        }

    };

    return (
        <>
            {/* 左上角返回按钮 */}
            <button type="button" className="back-btn" onClick={onSwitchToLogin}>
                <ArrowLeft size={20} />
            </button>

            <div className="login-card__header">
                <div className="icon-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white', opacity: 0.9 }}>
                    <UserPlus size={36} />
                </div>
                <h1>Create Account</h1>
                <p>Start your journey to master 10,000 words.</p>
            </div>

            <form className="login-form" onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon left" size={20} />
                        <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon left" size={20} />
                            <input type={showPassword? "text" :'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                            <button type="button" className="toggle-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon left" size={20} />
                            <input type={showPassword? "text" :'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                            <button type="button" className="toggle-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-actions" style={{ justifyContent: 'flex-start', gap: '0.75rem', marginTop: '-0.5rem' }}>
                    <label className="checkbox-wrapper">
                        <input type="checkbox" required />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text" style={{ fontSize: '0.75rem' }}>
                            I agree to the <a href="#" style={{ color: 'var(--color-primary)' }}>Terms</a> & <a href="#" style={{ color: 'var(--color-primary)' }}>Privacy</a>.
                        </span>
                    </label>
                </div>

                <button className="btn-submit group" type="submit" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
                    {isLoading ? '注册中...' : '注册'}
                    <CheckCircle className="arrow-icon" size={20} />
                </button>
            </form>

            <div className="login-card__footer">
                <p>Already have an account? <strong style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={onSwitchToLogin}>Sign In</strong></p>
            </div>
        </>
    );
}