import {useState, useEffect,useMemo} from 'react';
import { Card,Input,Radio,Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { generateWords } from './utils/mock';
import {type WordItem } from './types';
import WordList from './component/WordList';
import WordForm  from './component/WordForm';

const App = () => {

  const [words,setwords] = useState<WordItem[]>([])

  const [keyword,setKeyword] = useState('');
  const [filterLevel,setFilterLevel] = useState('all')

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
    const data = generateWords(10000);
    setwords(data);
    console.log("数据工厂产出:" ,data)
  },[])

  const handleDelete = (id:string) =>{
      const newWords = words.filter(item => item.id !==id);
      setwords(newWords);
  }

  const handleAdd = (item:WordItem) => {
    setwords(prev => [item,...prev])
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
            </Space>
          </Card>
            
          <WordList data={filterWords} onDelete={handleDelete} />
        </div>)
};

export default App;