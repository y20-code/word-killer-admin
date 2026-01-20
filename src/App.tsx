import {useState, useEffect,useMemo} from 'react';
import { Card,Input,message,Radio,Space,Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
    return setWords(prev => prev.map(item => {
      if(item.id ===id){
        const newStatus = item.status === '已背' ? '未背':'已背';
        return {...item, status:newStatus}
      }
      return item;
    }))
  }

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
            
          <WordList data={filterWords} onDelete={handleDelete} onEdit={handleEditClick} onDragEnd={handleDragEnd}/>
        </div>)
};

export default App;