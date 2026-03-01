import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './LoginMain.scss';

const MOCK_DB = {
  validEmail: 'admin@test.com',
  validPassword: '123'
};

export default function LoginMain  () {
    const [isLoginView, setIsLoginView] = useState(true);


    return (
        // 整个主区域的容器
        <main className="login-main">
            <motion.div 
                // 添加 key 值，让 motion 知道视图发生了切换，从而触发微动画
                key={isLoginView ? "login" : "register"}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="login-card"
            >
                {/* 顶部标题区 */}
                {isLoginView ? (
                    <LoginForm onSwitchToRegister={() => setIsLoginView(false)} />
                ) : (
                    <RegisterForm onSwitchToLogin={() => setIsLoginView(true)} />
                )}
            </motion.div>
        </main>
    )
}