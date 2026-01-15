import { useEffect} from 'react';
import { generateWords } from './utils/mock';

const App = () => {
  useEffect(() => {
    const data = generateWords(100);
    console.log("数据工厂产出:",data)
  },[])

  return <div>系统启动中...</div>
};

export default App;