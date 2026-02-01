import React from 'react';
// import { Virtuoso } from 'react-virtuoso';
import { Spin,Empty} from 'antd'
import {type WordItem } from '../types';
import WordCard from './WordCard'


import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface Props{
    data:WordItem[];
    onDelete:(id:string) => void;
    onEdit: (item:WordItem) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onToggle: (id:string) => void;
    loading?:boolean;
}

const WordList:React.FC<Props> = ({data,onDelete,onEdit,onDragEnd,onToggle,loading}) => {
    return (
        <div style={{
            height:'80vh',
            border: '1px solid #e8e8e8',
            display:'flex',
            flexDirection:'column',
            borderRadius:'8px',
            background:'#fff',
            boxShadow:'0 2px 8px rgba(0,0,0,0,1)'
        }} >
            <div style ={{
                padding:'16px',
                borderBottom:'1px solid #e8e8e8',
                fontWeight:'bold',
                fontSize:'16px',
                color:'#1890ff',
                flexShrink: 0,
            }}>
                📚 单词总库 (共 {data.length.toLocaleString()} 个)
            </div>

            <div style={{flex:1,overflowY:'auto',padding:'10px'}}>

                <Spin spinning={loading} tip="数据加载中...">
                    {!loading && data.length ===0 ? (
                        <Empty description="暂无单词，快去添加吧" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ):(
                        /* <Virtuoso */
                        <DndContext
                            collisionDetection={closestCenter}
                            onDragEnd={onDragEnd}
                        >   
                            <SortableContext
                                items={data.map(item => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {data.map(item => (
                                    <WordCard
                                        key={item.id}
                                        item={item}
                                        onDelete={onDelete}
                                        onEdit={onEdit}
                                        onToggle={onToggle}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </Spin>
            </div>
        </div>
    )
}

export default WordList;