import { useState } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './LoginNavbar.scss';

export default function LoginNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* 整个导航栏容器 */}
      <header className="navbar">

        {/* 左侧：Logo 品牌区 */}
        <div className="navbar__brand">
          <div className="icon-wrapper">
            <BookOpen size={24} />
          </div>
          <span className="title">VocabLearn</span>
        </div>
      
        {/* 中右侧：PC 端导航链接 */}
        <nav className="navbar__nav-desktop">
          <a href="#">字典</a>
          <a href="#">关于</a>
          <button className="btn-primary">体验</button>
        </nav>

        <button 
          className="navbar__toggle-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* 移动端下拉菜单面板 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="navbar__nav-mobile"
          >
            <a href="#">Dictionary</a>
            <a href="#">Courses</a>
            <a href="#">Flashcards</a>
            <button className="btn-primary" style={{ padding: '0.75rem' }}>
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

}