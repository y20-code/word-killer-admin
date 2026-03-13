import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, } from 'lucide-react';
import { message } from 'antd';
import { loginUser } from '../api/auth';
import { useUserStore } from '../store/userStore';
import type { TeacherInfo} from '../types/index';

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

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
            message.warning("账号和密码不能为空哦！");
            return;
        }

        setIsLoading(true);

        try {
            const res: { code: number; msg: string; data: TeacherInfo } = await loginUser(cleanEmail, cleanPassword);

            const user = res.data;

            if(user.role !== 'teacher'){
                message.error("权限不足：学生账号禁止登录管理后台！")
                setIsLoading(false);
                return;
            }

            message.success(`欢迎回来${user.fullName} 老师！!`)

            localStorage.setItem('token', 'mock_token_for_now');
            localStorage.setItem('userInfo', JSON.stringify(user));

            if (setCurrentUser) {
                setCurrentUser(user);
            }

            navigate('/dashboard');

        } catch (error) {
            console.log("登录请求被拦截了", error);
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
                        <input type="text" placeholder="请输入教师账号" value={email} onChange={(e) => setEmail(e.target.value)}/>
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