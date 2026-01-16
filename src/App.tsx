import {useState, useEffect} from 'react';
import { generateWords } from './utils/mock';

import {type WordItem } from './types';
import WordList from './component/WordList';

const App = () => {

  const [words,setwords] = useState<WordItem[]>([])

  useEffect(() => {
    const data = generateWords(10000);
    setwords(data);
    console.log("数据工厂产出:" ,data)
  },[])

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
            
            <WordList data={words} />
        </div>)
};

export default App;