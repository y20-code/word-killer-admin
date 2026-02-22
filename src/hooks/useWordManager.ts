import { useLocalStorage } from "./useLocalStorage";
import {type WordItem } from "../types";
import { generateWords } from "../utils/mock";
import {useEffect,useState} from 'react';
import {message} from 'antd';
import {arrayMove} from '@dnd-kit/sortable'
import { useCallback } from "react";

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
    const handleDelete = useCallback(async(id:string) => {
        setLoading(true)

        setWords(prevWords => prevWords.filter(item => item.id !== id));
        
        try {
            await api.delete(`/words/${id}`);
            
            message.success('删除成功');
            // fetchWords();
            // setWords(words.filter(item => item.id !==id));
        } catch(error){
            console.error(error)
            message.error("删除失败")
        }finally{
            setLoading(false)
        }
    },[]);

    // 改（全量)
    const handleUpdate = useCallback(async (id:string,updateItem:WordItem) =>{

        setWords(prevWords => prevWords.map(w => w.id === id ? updateItem : w));

        try {
            await api.put(`/words/${id}`,updateItem);
            message.success('修改成功');
            // fetchWords()
        }catch(error){
            console.error(error)
        }
    },[])

    // 改(状态切换)
    const handleToggle = useCallback((id:string) => {
        setWords((prevWords) => {
            const target = prevWords.find(w => w.id === id)

            if(!target) return prevWords;

            const newStats: "未背" | "已背" = target.status === '已背' ? '未背':'已背'
            const updatedItem = {...target,status:newStats};

            api.put(`/words/${id}`,updatedItem)
                .then(() => message.success('状态已更新'))
                .catch((err) => {
                    console.error(err);
                    message.error('网络开小差，请稍后再试');
                })

            return prevWords.map(w => w.id === id ? updatedItem : w);
        });
    },[])

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
    const overwriteWords = async (newWords: WordItem[]) => {
        setWords(newWords);
        try{
            //  批量同步给后端
            // 后端提供一个 /words/batch-import 接口。
            // 如果你的 mock 后端没有批量接口，我们就用 Promise.all 并发发送 post 请求！
            message.loading({content:'正在同步到云端...',key:'importSync'});

            await Promise.all(
                newWords.map(word => api.post('/words',word))
            );

            message.success({ content: '云端同步成功！刷新再也不会丢了！', key: 'importSync' });
        }catch (error) {
            console.error('云端同步失败', error);
            message.error({ content: '云端同步失败，请检查网络或后端接口', key: 'importSync' });
        }
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