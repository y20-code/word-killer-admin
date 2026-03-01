import React, { useState, useEffect } from 'react';
import '@wangeditor/editor/dist/css/style.css'; // 🌟 极其关键：引入富文本核心样式
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import type{ IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';

interface WordNoteEditorProps {
  wordEn: string; // 传进来的单词
  onSaveNote:(htmlData:string) => void;
}

const WordNoteEditor: React.FC<WordNoteEditorProps> = ({ wordEn,onSaveNote }) => {
  // 存储 editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  
  // 🌟 这里的 html 就是未来要存进 MySQL 的终极数据！
  const [html, setHtml] = useState(`<p>开始编写 <strong>${wordEn}</strong> 的高阶语法讲义和词根词缀...</p>`);

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = { 
    excludeKeys: ['group-video']
  };
  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = { placeholder: '请输入讲义内容...' };

  // ⚠️ 大厂极其看重的细节：组件销毁时，必须物理销毁 editor 实例，否则会造成严重的内存泄漏！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#333' }}>📝 {wordEn} - 高阶语法讲义室</h3>
        
        {/* 🌟 终极发射按钮：点击就触发上层传进来的保存请求 */}
        <button 
          onClick={() => onSaveNote(html)}
          style={{ padding: '8px 20px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          💾 保存讲义至数据库
        </button>
      </div>
      
      {/* 这里的 zIndex 是为了防止工具栏被其他弹窗遮挡 */}
      <div style={{ border: '1px solid #e8e8e8', zIndex: 100, borderRadius: '8px', overflow: 'hidden' }}>
        {/* 顶部工具栏：加粗、斜体、颜色、表格都在这里 */}
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
          style={{ borderBottom: '1px solid #e8e8e8' }}
        />
        
        {/* 下方编辑区：用户真正敲字的地方 */}
        <Editor
          defaultConfig={editorConfig}
          value={html}
          onCreated={setEditor}
          onChange={editor => setHtml(editor.getHtml())}
          mode="default"
          style={{ height: '400px', overflowY: 'hidden' }}
        />
      </div>

      {/* 战术侦察面板：实时查看底层生成的 HTML 数据 */}
      <div style={{ marginTop: '15px', padding: '10px', background: '#f6f8fa', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>🔍 底层 HTML 数据监控 (将存入数据库):</p>
        <code style={{ fontSize: '12px', color: '#d93025' }}>{html}</code>
      </div>
    </div>
  );
};

export default WordNoteEditor;