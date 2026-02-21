import { useLocalStorage } from "./useLocalStorage";
import {type WordItem } from "../types";
import { generateWords } from "../utils/mock";
import {useEffect,useState} from 'react';
import {message} from 'antd';
import {arrayMove} from '@dnd-kit/sortable'

import { useUndo } from "./useUndo";

import api from '../api/request';

export const useWordManager = () => {
    const CACHE_KEY = 'word_killer_data';
    // const [words,setWords] = useState<WordItem[]>([]);

    const {
        state:words,
        set: setWords, 
        undo, 
        redo, 
        reset, 
        canUndo, 
        canRedo
    } = useUndo<WordItem[]>([]);

    const [loading,setLoading] = useState(false);


    const fetchWords = async () => {
        setLoading(true);
        try{
            const data = await api.get<any,WordItem[]>('/words');
            reset(data)
            setWords(data);
        } catch (error) {
            console.error('获取列表失败',error)
        } finally{
            setLoading(false)
        }
    }

    useEffect(() =>{
        fetchWords();
    },[]);

    // 增
    const handleAdd = async (item:WordItem) =>{
        try {
            await api.post('/words',item);
            message.success('添加成功');
            // fetchWords();

            setWords([item,...words])
        } catch(error){
            console.log(error)
        }
    }

    // 删
    const handleDelete = async (id:string) => {
        setLoading(true)

        setWords(words.filter(item => item.id !== id));
        
        try {
            await api.delete(`/words/${id}`);
            
            message.success('删除成功');
            // fetchWords();
            setWords(words.filter(item => item.id !==id));
        } catch(error){
            console.error(error)
            message.error("删除失败")
        }finally{
            setLoading(false)
        }
    };

    // 改（全量)
    const handleUpdate = async (id:string,updateItem:WordItem) =>{

        setWords(words.map(w => w.id === id ? updateItem : w));

        try {
            await api.put(`/words/${id}`,updateItem);
            message.success('修改成功');
            // fetchWords()
        }catch(error){
            console.error(error)
        }
    }

    // 改(状态切换)
    const handleToggle = (id:string) => {
        const target = words.find(w => w.id === id);
        if(!target) return;
        const newStatus = target.status === '已背' ? '未背' : '已背';

        handleUpdate(id, { ...target, status: newStatus });
    }

    // 拖拽排序
    const handleDragSort = (oldIndex:number,newIndex:number) => {
        const newWords = [...words];
        const [removed] = newWords.splice(oldIndex, 1);
        newWords.splice(newIndex, 0, removed);
        setWords(newWords);
    }

    //重置
    const handleReset = () => {
        fetchWords();
        message.info('数据已刷新');
    }

    // 导入数据 (覆盖)
    const overwriteWords = (newWords: WordItem[]) => {
        setWords(newWords);
        message.warning('注意：导入的数据暂时只保存在本地，刷新会消失（需后端支持批量导入接口）');
    }

    return {
        words,
        loading,
        handleAdd,
        handleDelete,
        handleUpdate,
        handleToggle,
        handleDragSort,
        handleReset,
        overwriteWords,

        undo,
        redo,
        canUndo,
        canRedo
    };

}