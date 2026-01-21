import { useLocalStorage } from "./useLocalStorage";
import {type WordItem } from "../types";
import { generateWords } from "../utils/mock";
import {useEffect} from 'react';
import {message} from 'antd';
import {arrayMove} from '@dnd-kit/sortable'

export const useWordManager = () => {
    const CACHE_KEY = 'word_killer_data';
    const [words,setWords] = useLocalStorage<WordItem[]>(CACHE_KEY,[]);

    useEffect(() =>{
        if(words.length === 0) {
            setWords(generateWords(20));
        }
    },[]);

    // 增
    const handleAdd = (item:WordItem) =>{
        setWords(prev => [item,...prev]);
    }

    // 删
    const handleDelete =(id:string) => {
        setWords(prev => prev.filter(item => item.id !== id))
    };

    // 改（全量)
    const handleUpdate = (id:string,updateItem:WordItem) =>{
        setWords(prev => prev.map(item => item.id ===id ? {...item,...updateItem} : item))
    }

    // 改(状态切换)
    const handleToggle = (id:string) => {
        setWords(prev => prev.map(item => 
            item.id === id ? {...item,status:item.status === '已背' ? '未背':'已背'}:item
        ))
    }

    // 拖拽排序
    const handleDragSort = (oldIndex:number,newIndex:number) => {
        setWords(items => arrayMove(items,oldIndex,newIndex));
    }

    //重置
    const handleReset = () => {
        localStorage.removeItem(CACHE_KEY);
        message.success('重置中...');
        setTimeout(() => window.location.reload(),1000);
    }

    // 导入数据 (覆盖)
    const overwriteWords = (newWords: WordItem[]) => {
        setWords(newWords);
    }

    return {
        words,
        handleAdd,
        handleDelete,
        handleUpdate,
        handleToggle,
        handleDragSort,
        handleReset,
        overwriteWords
    };

}