import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react';
import { message } from 'antd';
import { loginUser } from '../api/auth';
import { useUserStore } from '../store/userStore';

interface LoginFormProps {
    onSwitchToRegister: () => void;

}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {

    const setCurrentUser = useUserStore(state => state.setCurrentUser);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading,setIsLoading] = useState(false)
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        try {
            const allUsers: any = await loginUser(email, password);

            const user = allUsers.find(
                (u: any) => u.email === cleanEmail && u.password === cleanPassword
            );

            if (user) {
                message.success(`欢迎回来，${user.email}！`);
                
                localStorage.setItem('token', `mock_token_${user.id}`);
                localStorage.setItem('userInfo', JSON.stringify(user));

                if (setCurrentUser) {
                     setCurrentUser(user);
                }
                
                // 跳转到主页面 (班级概览)
                navigate('/dashboard');
            } else {
                message.error("邮箱或密码错误，请重试！"); 
            }
        } catch (error) {
            message.error("登录服务异常");
        } finally{
            setIsLoading(false);
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