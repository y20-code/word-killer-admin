import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Volume2 } from 'lucide-react';
import './DictionaryAdmin.scss';

// 🌟 1. 升级版词条数据结构
interface Vocabulary {
  id: string;
  bookId: string;
  word: string;
  partOfSpeech: string; // 新增：词性 (如 v., n., adj.)
  translation: string;  // 纯中文释义 (如 抓住，陷阱)
  example?: string;
  category: string;
  phonetic?: string;
  audioUrl?: string;    // 新增：音频发音链接占位
}

export default function DictionaryAdmin() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 表单状态分离
  const [newWord, setNewWord] = useState('');
  const [newPos, setNewPos] = useState('n.'); // 默认名词
  const [newExample, setNewExample] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newGrade, setNewGrade] = useState('');

  const API_BASE_URL = 'http://localhost:3002';

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vocabularies`);
      const data: Vocabulary[] = await res.json();
      setVocabularies(data);
    } catch (error) {
      console.error("获取词库失败:", error);
    }
  };

const handleAddWord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    // 年级现在是必填项，因为我们要拿它来建书！
    if (!newWord || !newTranslation || !newGrade) return alert("单词、释义和适用阶段不能为空！");

    setLoading(true);

    try {
      // 🌟 神仙逻辑 1：先去数据库查，有没有这本名叫“高一”的词书？
      const booksRes = await fetch(`${API_BASE_URL}/wordbooks`);
      const books = await booksRes.json();
      let targetBook = books.find((b: any) => b.name === newGrade.trim());

      // 🌟 神仙逻辑 2：如果没有，系统瞬间自动发请求，在数据库里建一本新书！
      if (!targetBook) {
        const newBookPayload = {
          name: newGrade.trim(),
          coverImage: "https://api.dicebear.com/7.x/shapes/svg?seed=" + newGrade.trim(),
          unitCount: 1,
          description: `系统自动聚合的 ${newGrade.trim()} 专属词库`
        };
        const createBookRes = await fetch(`${API_BASE_URL}/wordbooks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBookPayload)
        });
        targetBook = await createBookRes.json(); // 拿到刚建好的新书，里面带有自动生成的 id
      }

      // 🌟 神仙逻辑 3：把单词精准挂载到这本（已存在或刚建好）的书下面
      const newEntry: Omit<Vocabulary, 'id'> = {
        bookId: targetBook.id, // 动态绑定刚才查到或创建的 bookId
        word: newWord.trim(),
        partOfSpeech: newPos,   
        translation: newTranslation.trim(), 
        category: newGrade.trim(),
        example: newExample.trim(), // 写入例句
        phonetic: "", 
        audioUrl: "https://mock-audio-url.com/placeholder.mp3" 
      };

      await fetch(`${API_BASE_URL}/vocabularies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      
      // 清空表单
      setNewWord('');
      setNewTranslation('');
      setNewExample(''); // 清空例句
      // 注意：这里不自动清空 newGrade，因为录入员通常会连续录入同一个年级的词！体验拉满！
      setNewPos('n.'); 
      fetchWords();
    } catch (error) {
      console.error("添加失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除吗？这将从底层数据库中彻底抹除该词条。")) return;
    try {
      await fetch(`${API_BASE_URL}/vocabularies/${id}`, { method: 'DELETE' });
      fetchWords(); 
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  // 模拟播放音频功能
  const playAudio = (word: string) => {
    alert(`🎵 模拟播放单词 [ ${word} ] 的发音...\n(未来这里将接入真实的 audioUrl)`);
  };

  return (
    <div className="dict-admin-container">
      <div className="header">
        <h2><BookOpen className="icon" /> 数据录入中心 (教研团队专属)</h2>
        <p>此页面与教师排课端物理隔离。您录入的高质量、结构化数据，将成为全平台的数据基石。</p>
      </div>

      <form className="add-word-card" onSubmit={handleAddWord}>
        <div className="input-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="英文单词 (如: catch)" 
            value={newWord} 
            onChange={e => setNewWord(e.target.value)} 
            style={{ flex: 1.5 }}
          />
          
          {/* 🌟 词性改为规范的下拉选择，避免人工拼写错误 */}
          <select 
            value={newPos} 
            onChange={e => setNewPos(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            <option value="n.">n. (名词)</option>
            <option value="v.">v. (动词)</option>
            <option value="adj.">adj. (形容词)</option>
            <option value="adv.">adv. (副词)</option>
            <option value="prep.">prep. (介词)</option>
            <option value="conj.">conj. (连词)</option>
            <option value="phr.">phr. (词组)</option>
          </select>

          <input 
            type="text" 
            placeholder="纯中文释义 (如: 陷阱)" 
            value={newTranslation} 
            onChange={e => setNewTranslation(e.target.value)} 
            style={{ flex: 2 }}
          />
          <input 
            type="text" 
            placeholder="例句 (如: It's a trap!)" 
            value={newExample} 
            onChange={e => setNewExample(e.target.value)} 
            style={{ flex: 2 }}
          />
          <input 
            type="text" 
            placeholder="适用阶段 (如: 初三)" 
            value={newGrade} 
            onChange={e => setNewGrade(e.target.value)} 
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading} className="btn-submit">
            <Plus size={18} /> {loading ? '保存中...' : '录入'}
          </button>
        </div>
      </form>

      <div className="table-container">
        <table className="word-table">
          <thead>
            <tr>
              <th>发音</th>
              <th>单词</th>
              <th>词性</th>
              <th>中文释义</th>
              <th>分类/阶段</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {vocabularies.map(item => (
              <tr key={item.id}>
                <td>
                  <button 
                    onClick={() => playAudio(item.word)} 
                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}
                    title="试听发音"
                  >
                    <Volume2 size={20} />
                  </button>
                </td>
                <td className="fw-bold">{item.word}</td>
                {/* 词性独立展示，可以加不同的颜色样式 */}
                <td style={{ color: '#ef4444', fontWeight: 600, fontStyle: 'italic' }}>
                  {item.partOfSpeech || '-'}
                </td>
                <td>{item.translation}</td>
                <td><span className="badge">{item.category}</span></td>
                <td>
                  <button onClick={() => handleDelete(item.id)} className="btn-delete" title="彻底删除">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vocabularies.length === 0 && <div className="empty-state">底层词库暂无数据，请开始录入</div>}
      </div>
    </div>
  );
}