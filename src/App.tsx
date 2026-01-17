import {useState, useEffect,useMemo} from 'react';
import { Card,Input,message,Radio,Space,Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { generateWords } from './utils/mock';
import {type WordItem } from './types';
import WordList from './component/WordList';
import WordForm  from './component/WordForm';
import EditModal from './component/EditModal';

const App = () => {

  const CACHE_KEY = 'word_killer_data';

  const [words,setWords] = useState<WordItem[]>([])

  const [keyword,setKeyword] = useState('');
  const [filterLevel,setFilterLevel] = useState('all')

  const [currentProto,setcurrentProto] = useState<WordItem | null>(null)

  const [isModalOpen,setIsModalOpen] = useState(false)

  const filterWords = useMemo(() =>{

    return words.filter(item => {
      const isLevelMatch = filterLevel === 'all' || item.level === filterLevel;

      const lowerKeyword = keyword.trim().toLowerCase();
      const lowerWord = item.en.toLowerCase();

      const isKeywordMatch  = lowerWord.includes(lowerKeyword) || item.cn.includes(lowerKeyword);

      return isLevelMatch && isKeywordMatch;
    })
  },[words,keyword,filterLevel])

  useEffect(() => {
    
    const cache = localStorage.getItem(CACHE_KEY);

    if(cache){
      try{
        const data = JSON.parse(cache);
        setWords(data)
        console.log('读取缓存成功')
      } catch (error) {
        console.error('缓存数据损坏，重新生成...', error);
        const data = generateWords(20000);
        setWords(data);
      }
    }else{
      console.log('正在生成')
      const data = generateWords(10000);
      setWords(data);
      console.log("数据工厂产出:" ,data)
    }
  },[])

  useEffect(() => {
    if(words.length>0){
      localStorage.setItem(CACHE_KEY,JSON.stringify(words))
      // message.success("数据保存成功")
    }
  },[words])

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
            
          <WordList data={filterWords} onDelete={handleDelete} onEdit={handleEditClick} />
        </div>)
};

export default App;