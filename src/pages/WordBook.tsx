import React, { useState, useMemo } from 'react';
import { type WordItem } from '../types'
import { WordList, WordForm, EditModal, FilterBar, FileHeader } from '../component';
import { useDebounce } from '../hooks';
import { type DragEndEvent } from '@dnd-kit/core';

interface Props {
    words: WordItem[];
    handleAdd: (item: WordItem) => void;
    handleDelete: (id: string) => void;
    handleUpdate: (id: string, item: WordItem) => void;
    handleToggle: (id: string) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    handleReset: () => void;
    handleExport: () => void;
    handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const WordBook: React.FC<Props> = ({
    words, handleAdd, handleDelete, handleUpdate,
    handleToggle, handleDragEnd, handleReset,
    handleExport, handleImport
}) => {

    const [keyword, setKeyword] = useState('')
    const [filterLevel,setFilterLevel] = useState('all')
    const [isModalOpen,setIsModalOpen] = useState(false)
    const [currentProto,setcurrentProto] = useState<WordItem | null>(null);
    const debouncedKeyWord = useDebounce(keyword,300);

    const filterWords = useMemo(() =>{
        const lowerKeyword = debouncedKeyWord.trim().toLowerCase();
        return words.filter(item => {
            const isLevelMatch = filterLevel === 'all' || item.level === filterLevel;
            const lowerWord = item.en.toLowerCase();
            const isKeywordMath =  lowerWord.includes(lowerKeyword) || item.cn.includes(lowerKeyword);
            return isLevelMatch && isKeywordMath;
        })

    },[words,debouncedKeyWord,filterLevel]);

    const handleEditClick =(item:WordItem) =>{
        setcurrentProto(item);
        setIsModalOpen(true)
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 >📖 单词管理</h2>
                <FileHeader onExport={handleExport} onImport={handleImport} />
            </div>

            <WordForm onAdd={handleAdd} />

            <FilterBar
                keyword={keyword}
                setKeyword={setKeyword}
                filterLevel={filterLevel}
                setFilterLevel={setFilterLevel}
                onReset={handleReset}
            />

            <WordList 
                data={filterWords} 
                onDelete={handleDelete} 
                onEdit={handleEditClick} 
                onDragEnd={handleDragEnd} 
                onToggle={handleToggle}
            />

            <EditModal 
                isOpen={isModalOpen}
                currentWord={currentProto}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleUpdate}
            />
        </div>
    )
}

export default WordBook;