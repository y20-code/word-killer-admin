import LoginNavbar from '../components/LoginNavbar';
import LoginMain from '../components/LoginMain';
import LoginFooter from '../components/LoginFooter';
export default function Login() {
  return (
    // 使用我们在 index.scss 里定义的 .app-container
    <div className="app-container">
      
      {/* 专门用一个容器把背景装饰物装起来，干净利落 */}
      <div className="bg-decorations">
        <div className="dot-grid" />
        <div className="faint-letter top-left">ABCDEFGH</div>
        <div className="faint-letter top-right">QRSTUVWX</div>
        <div className="faint-letter bottom-left">Y</div>
        <div className="faint-letter bottom-right">Z</div>
      </div>

      <LoginNavbar />
      <LoginMain />
      <LoginFooter />
    </div>
  );
}