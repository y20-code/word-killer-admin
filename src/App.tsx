import {useState, useEffect,useMemo,useRef} from 'react';
import { Card,Input,message,Radio,Space,Button } from 'antd';
import { SearchOutlined,DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { generateWords } from './utils/mock';

import {type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import {type WordItem } from './types';

import WordList from './component/WordList';
import WordForm  from './component/WordForm';
import EditModal from './component/EditModal';
import StatisticsChart from './component/StatisTicsChart'

import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebounce } from './hooks/useDebounce';

const App = () => {

  const CACHE_KEY = 'word_killer_data';

  const [words,setWords] = useLocalStorage<WordItem[]>(CACHE_KEY,[]);

  
  const [keyword,setKeyword] = useState('');

  const debouncedKeyWord = useDebounce(keyword,300)

  const [filterLevel,setFilterLevel] = useState('all')

  const [currentProto,setcurrentProto] = useState<WordItem | null>(null)

  const [isModalOpen,setIsModalOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterWords = useMemo(() =>{

    const lowerKeyword = debouncedKeyWord.trim().toLowerCase();

    return words.filter(item => {
      const isLevelMatch = filterLevel === 'all' || item.level === filterLevel;
      
      const lowerWord = item.en.toLowerCase();

      const isKeywordMatch  = lowerWord.includes(lowerKeyword) || item.cn.includes(lowerKeyword);

      return isLevelMatch && isKeywordMatch;
    })
  },[words,debouncedKeyWord,filterLevel])
  

  useEffect(() =>{
    if(words.length === 0){
      const mocks = generateWords(20);
      setWords(mocks);
    }
  },[])

  const handleRemoveAll = () =>{
    localStorage.removeItem(CACHE_KEY)
    message.success('已清空缓存，系统重置中...');
    
    // 延迟一点点再刷新，让用户看清提示
    setTimeout(() => {
        window.location.reload();
    }, 1000);
  }

  const handleDelete = (id:string) =>{
      const newWords = words.filter(item => item.id !==id);
      setWords(newWords);
  }

  const handleAdd = (item:WordItem) => {
    setWords(prev => [item,...prev])
  }

  const handerUpdate = (id:string,updatedItem:WordItem) =>{
    return setWords(prev => prev.map(item =>{

      if(item.id === id){
        return {...item,...updatedItem}
      }
      return item;
    }))
  }

  const handleEditClick = (item:WordItem) => {
    setcurrentProto(item);
    setIsModalOpen(true);
  }

  const handleToggle = (id:string) => {
    return setWords(prev => prev.map(item =>{
      if(item.id ===id){
        const newsStatus = item.status === '已背' ? '未背' :'已背';
        return {...item,status:newsStatus}
      } 
      return item
    }))
  }

  const handleExport = () => {

    const jsonStr = JSON.stringify(words,null,2)

    const blob = new Blob([jsonStr],{type:'application/json'});

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `word-killer-backup-${new Date().toISOString().split('T')[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    // A. 拿到用户选的文件 (可能选了多个，我们只要第0个)
    const file = event.target.files?.[0];
    if (!file) return;

    // B. 创建一个“文件读取器” (FileReader 是浏览器自带的工具)
    const reader = new FileReader();

    // C. 告诉读取器：等你读完了(onload)，你要做什么？
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string; // 拿到读出来的字符串
        const parseData = JSON.parse(result); // 把字符串变回数组

        // D. 简单的安全检查：确保读出来的是个数组，不是乱七八糟的东西
        if (Array.isArray(parseData)) {
          // ⚠️ 这一步最关键：更新数据！
          // 这里有个选择：是“覆盖”旧数据，还是“合并”？
          // 我们先做简单的：直接覆盖 (Confirm 提示更好，但先做简单的)
          setWords(parseData); 
          message.success('备份导入成功！');
        } else {
          message.error('文件格式不对，必须是单词数组');
        }
      } catch (error) {
        message.error('JSON 解析失败，文件可能损坏');
      }
    };

    // D. 发令枪：开始读取！(按文本方式读取)
    reader.readAsText(file);
    
    // E. 清空 input
    // 为什么要清空？因为如果用户先选了 A.json，发现不对，又选了一次 A.json
    // 如果不清空，浏览器会认为“文件没变”，不会触发 onChange
    event.target.value = '';
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event; // active: 被拖的人, over: 被撞的人

    // 如果 over 存在，且 dragged 确实换了位置
    if (over && active.id !== over.id) {
        setWords((items) => {
            // 找到旧位置的索引
            const oldIndex = items.findIndex((item) => item.id === active.id);
            // 找到新位置的索引
            const newIndex = items.findIndex((item) => item.id === over.id);

            // 使用 dnd-kit 提供的 arrayMove 重新排序
            return arrayMove(items, oldIndex, newIndex);
        });
    }
};


  return (<div style={{ 
            padding: '40px', 
            maxWidth: '800px', 
            margin: '0 auto', // 居中显示
            background: '#f0f2f5', 
            minHeight: '100vh' 
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#001529' }}>
                Word Killer 单词 ⚔️
            </h1>

            <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>

                {/* 1. 真正的上传控件 (藏起来 display: none) */}
                <input 
                    type="file" 
                    ref={fileInputRef} // 绑上 ref
                    style={{ display: 'none' }} 
                    accept=".json" // 限制只能选 json
                    onChange={handleImport} // 选完触发导入逻辑
                />

                {/* 2. 导出按钮 */}
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                    导出备份
                </Button>

                {/* 3. 导入按钮：点击它 -> 触发 input 的 click */}
                <Button 
                    icon={<UploadOutlined />} 
                    onClick={() => fileInputRef.current?.click()}
                >
                    导入备份
                </Button>
            </div>

          <WordForm onAdd={handleAdd}/>

          <StatisticsChart data={words} />

          <Card 
            style={{marginBottom:20}}
          >
            <Space>
              <Input 
              prefix={<SearchOutlined/>}
              style={{width:200}}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            
            <Radio.Group
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value='all'>全部</Radio.Button>
              <Radio.Button value='高考'>高考</Radio.Button>
              <Radio.Button value="四级">四级</Radio.Button>
              <Radio.Button value="六级">六级</Radio.Button>
              <Radio.Button value="雅思">雅思</Radio.Button>
            </Radio.Group>

            <Button onClick={handleRemoveAll}>重置数据</Button>
            </Space>
          </Card>

          <EditModal 
            isOpen={isModalOpen}
            currentWord={currentProto}
            onClose={() => setIsModalOpen(false)}
            onUpdate={handerUpdate}
          />
            
          <WordList data={filterWords} onDelete={handleDelete} onEdit={handleEditClick} onDragEnd={handleDragEnd} onToggle={handleToggle}/>
        </div>)
};

export default App;