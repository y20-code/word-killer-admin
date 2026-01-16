import {useState, useEffect} from 'react';
import { generateWords } from './utils/mock';
import {type WordItem } from './types';
import WordList from './component/WordList';
import WordForm  from './component/WordForm';

const App = () => {

  const [words,setwords] = useState<WordItem[]>([])

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
            
          <WordList data={words} onDelete={handleDelete} />
        </div>)
};

export default App;