import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Volume2, PlusCircle, MinusCircle } from 'lucide-react';
import './DictionaryAdmin.scss';

interface Vocabulary {
  id: string;
  bookId: string;
  word: string;
  partOfSpeech: string; 
  translation: string;  
  example?: string;
  category: string;
  phonetic?: string;
  audioUrl?: string;    
}

// 🌟 核心突破：定义单条释义的数据结构
interface Definition {
  pos: string;
  meaning: string;
}

export default function DictionaryAdmin() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [newWord, setNewWord] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newGrade, setNewGrade] = useState('');
  
  // 🌟 核心突破：把词性和释义组合成“动态数组”，默认给一行空数据
  const [definitions, setDefinitions] = useState<Definition[]>([{ pos: 'n.', meaning: '' }]);

  const API_BASE_URL = 'http://localhost:3002';
  const posList = ['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.', 'phr.'];

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

  // 🌟 动态增加/删除/修改释义行的核心逻辑
  const addDefinitionRow = () => {
    setDefinitions([...definitions, { pos: 'v.', meaning: '' }]);
  };

  const removeDefinitionRow = (index: number) => {
    const newDefs = [...definitions];
    newDefs.splice(index, 1);
    setDefinitions(newDefs);
  };

  const updateDefinition = (index: number, field: 'pos' | 'meaning', value: string) => {
    const newDefs = [...definitions];
    newDefs[index][field] = value;
    setDefinitions(newDefs);
  };

  const handleAddWord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    if (!newWord || !newGrade) return alert("单词和适用阶段不能为空！");
    
    // 校验：所有释义行都必须填了中文
    const hasEmptyMeaning = definitions.some(d => d.meaning.trim() === '');
    if (hasEmptyMeaning) return alert("请确保每一行的中文释义都已填写！");

    setLoading(true);

    try {
      const booksRes = await fetch(`${API_BASE_URL}/wordbooks`);
      const books = await booksRes.json();
      let targetBook = books.find((b: any) => b.name === newGrade.trim());

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
        targetBook = await createBookRes.json(); 
      }

      // 🌟 神级数据聚合：把动态行数据，压缩成极其规范的字符串！
      // 提取所有不重复的词性 (例如： "n., v.")
      const uniquePos = Array.from(new Set(definitions.map(d => d.pos))).join(', ');
      // 聚合释义 (例如： "n. 水；v. 浇水")
      const combinedTranslation = definitions.map(d => `${d.pos} ${d.meaning.trim()}`).join('；');

      const newEntry: Omit<Vocabulary, 'id'> = {
        bookId: targetBook.id, 
        word: newWord.trim(),
        partOfSpeech: uniquePos,       // 存入: "n., v."
        translation: combinedTranslation, // 存入: "n. 水；v. 浇水"
        category: newGrade.trim(),
        example: newExample.trim(), 
        phonetic: "", 
        audioUrl: `https://dict.youdao.com/dictvoice?audio=${newWord.trim()}&type=2` 
      };

      await fetch(`${API_BASE_URL}/vocabularies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      
      // 录入成功，重置表单（保留年级，方便连续录入）
      setNewWord('');
      setNewExample(''); 
      setDefinitions([{ pos: 'n.', meaning: '' }]); 
      fetchWords();
    } catch (error) {
      console.error("添加失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要彻底删除该词条吗？")) return;
    try {
      await fetch(`${API_BASE_URL}/vocabularies/${id}`, { method: 'DELETE' });
      fetchWords(); 
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const playAudio = (word: string) => {
    alert(`🎵 模拟播放: [ ${word} ]`);
  };

  return (
    <div className="dict-admin-container">
      <div className="header">
        <h2><BookOpen className="icon" /> 数据录入中心 (教研团队专属)</h2>
        <p>此页面与教师排课端物理隔离。您录入的高质量、结构化数据，将成为全平台的数据基石。</p>
      </div>

      <form className="add-word-card" onSubmit={handleAddWord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* 第一行：单词与基础信息 */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="英文单词 (如: water)" 
            value={newWord} 
            onChange={e => setNewWord(e.target.value)} 
            style={{ flex: 1.5, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <input 
            type="text" 
            placeholder="适用阶段 (如: 初二)" 
            value={newGrade} 
            onChange={e => setNewGrade(e.target.value)} 
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        {/* ==================== 🌟 核心：动态释义矩阵 ==================== */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>
            📌 多维度词性释义配置：
          </div>
          
          {definitions.map((def, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
              <select 
                value={def.pos} 
                onChange={e => updateDefinition(index, 'pos', e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', width: '120px' }}
              >
                {posList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              
              <input 
                type="text" 
                placeholder="对应中文释义 (如: 水)" 
                value={def.meaning} 
                onChange={e => updateDefinition(index, 'meaning', e.target.value)} 
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />

              {/* 第一行不许删，从第二行开始显示删除按钮 */}
              {definitions.length > 1 && (
                <button type="button" onClick={() => removeDefinitionRow(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="删除该释义">
                  <MinusCircle size={20} />
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addDefinitionRow} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: 0, marginTop: '4px' }}>
            <PlusCircle size={16} /> 添加其他词性与释义
          </button>
        </div>
        {/* ===================================================================== */}

        {/* 附加信息与提交 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="经典例句 (如: Pour some water.)" 
            value={newExample} 
            onChange={e => setNewExample(e.target.value)} 
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <button type="submit" disabled={loading} className="btn-submit" style={{ padding: '0 32px' }}>
            <Plus size={18} /> {loading ? '保存中...' : '录入词库'}
          </button>
        </div>

      </form>

      <div className="table-container">
        <table className="word-table">
          <thead>
            <tr>
              <th>发音</th>
              <th>单词</th>
              <th>词汇归类</th>
              <th>标准组合释义 (自动聚合)</th>
              <th>阶段</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {vocabularies.map(item => (
              <tr key={item.id}>
                <td>
                  <button onClick={() => playAudio(item.word)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }} title="试听发音">
                    <Volume2 size={20} />
                  </button>
                </td>
                <td className="fw-bold" style={{ fontSize: '16px' }}>{item.word}</td>
                <td style={{ color: '#ef4444', fontWeight: 600, fontStyle: 'italic' }}>
                  {item.partOfSpeech || '-'}
                </td>
                {/* 🌟 这里会展示完美聚合的释义 */}
                <td style={{ color: '#334155', fontWeight: 500 }}>{item.translation}</td>
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