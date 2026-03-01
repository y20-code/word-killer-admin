import './LoginFooter.scss';

export default function LoginFooter() {
    return (
        <footer className="login-footer">
            <div className="login-footer__container">
                
                {/* 左侧：版权信息 */}
                <div className="copyright">
                <p className="copyright__main">© 2026 VocabLearn Interactive. All rights reserved.</p>
                <p className="copyright__sub">Empowering vocabulary growth worldwide.</p>
                </div>

                {/* 右侧：底部导航 */}
                <nav className="footer-nav">
                <a href="#">隐私权政策，隐私策略</a>
                <a href="#">服务条款</a>
                <a href="#">帮助中心</a>
                <a href="#">联系</a>
                </nav>

            </div>
        </footer>
    )
}