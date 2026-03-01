import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react';
const MOCK_DB = {
  validEmail: 'admin@test.com',
  validPassword: '123'
};

interface LoginFormProps {
    onSwitchToRegister: () => void;

}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return alert("邮箱和密码不能为空哦！");

        if (email === MOCK_DB.validEmail && password === MOCK_DB.validPassword) {
            alert("登录成功！即将进入系统...");
            localStorage.setItem('word_killer_token', 'mock_token_12345');
            navigate('/dashboard');
        } else {
            alert("账号或密码错误，请重试！\n(提示：admin@test.com / 123)");
        }
    };

    return (
        <>
            <div className="login-card__header">
                <div className="icon-badge">
                    <BookOpen size={40} />
                </div>
                <h1>Welcome Back</h1>
                <p>Continue your journey to master 10,000 words.</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon left" size={20} />
                        <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                </div>

                <div className="form-group">
                    <div className="label-row">
                        <label>Password</label>
                        <a href="#" className="forgot-link">Forgot?</a>
                    </div>
                    <div className="input-wrapper">
                        <Lock className="input-icon left" size={20} />
                        <input type={showPassword ? "text" : "password"} placeholder="Learn123!" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" className="toggle-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="form-actions">
                    <label className="checkbox-wrapper">
                        <input type="checkbox" />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">Remember me for 30 days</span>
                    </label>
                    {/* 🏆 触发父组件传过来的切换函数 */}
                    <button type="button" className="btn-secondary" onClick={onSwitchToRegister}>
                        Sign Up
                    </button>
                </div>

                <button className="btn-submit group">
                    Sign In
                    <ArrowRight className="arrow-icon" size={20} />
                </button>
            </form>

            <div className="login-card__footer">
                <p>Trusted by over <strong>50,000</strong> learners worldwide</p>
            </div>
        </>
    );
}