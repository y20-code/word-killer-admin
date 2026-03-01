import { useState } from 'react';
import { UserPlus, Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) return alert("两次输入的密码不一致！");
        if (!email) return alert("请填写邮箱！");

        alert("🎉 注册成功！请使用新账号登录。");
        // 注册成功后，直接切回登录页
        onSwitchToLogin();
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

                <button className="btn-submit group" type="submit" style={{ marginTop: '0.5rem' }}>
                    Sign Up Now
                    <CheckCircle className="arrow-icon" size={20} />
                </button>
            </form>

            <div className="login-card__footer">
                <p>Already have an account? <strong style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={onSwitchToLogin}>Sign In</strong></p>
            </div>
        </>
    );
}