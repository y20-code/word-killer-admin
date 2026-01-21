import React from 'react';
// import { Virtuoso } from 'react-virtuoso';
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
}

const WordList:React.FC<Props> = ({data,onDelete,onEdit,onDragEnd,onToggle}) => {
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

            {/* <Virtuoso */}
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
        </div>
    )
}

export default WordList;