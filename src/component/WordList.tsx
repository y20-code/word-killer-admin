import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import {type WordItem } from '../types';
import WordCard from './WordCard'

interface Props{
    data:WordItem[];
    onDelete:(id:string) => void;
    
}

const WordList:React.FC<Props> = ({data,onDelete}) => {
    return (
        <div style={{
            height:'80vh',
            border: '1px solid #e8e8e8',
            borderRadius:'8px',
            background:'#fff',
            boxShadow:'0 2px 8px rgba(0,0,0,0,1)'
        }} >
            <div style ={{
                padding:'16px',
                borderBottom:'1px solid #e8e8e8',
                fontWeight:'bold',
                fontSize:'16px',
                color:'#1890ff'
            }}>
                📚 单词总库 (共 {data.length.toLocaleString()} 个)
            </div>

            <Virtuoso
                style={{ height: 'calc(100% - 55px)' }} // 减去顶栏的高度
                data={data}
                itemContent={(index, item) => {
                    // 直接渲染我们的砖块组件，代码极其干净！
                    return <WordCard item={item} onDelete={onDelete} />;
                }}
            />
        </div>
    )
}

export default WordList;