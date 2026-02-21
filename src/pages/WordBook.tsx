import React, { useState, useMemo } from 'react';
import { type WordItem } from '../types'
import { WordList, WordForm, EditModal, FilterBar, FileHeader } from '../component';
import { useDebounce, } from '../hooks';

import {useWordContext} from '../contexts/WordContext'

export interface treeNode {
    value: string;
    title: string;
    children?: treeNode[];
}

const treeData: treeNode[] = [
    { value: 'all', title: '全部' },
    {
        value: '国内考试',
        title: '国内考试',
        children: [
            { value: '高考', title: '高考' },
            { value: '四级', title: '四级' },
            { value: '六级', title: '六级' },
        ]
    },
    { value: '雅思', title: '雅思' }
];

const getWhiteList = (tree: treeNode[], targetValue: string) => {
    let result: string[] = [];

    const findNode = (nodes: treeNode[], val: string): treeNode | null => {
        for (let node of nodes) {
            if (node.value === val) return node;
            if (node.children) {
                let found = findNode(node.children, val);
                if (found) return found;
            }
        }
        return null;
    }

    const targetNode = findNode(tree, targetValue);

    const collectValues = (node: treeNode) => {
        if (!node) return;
        result.push(node.value); // 比如把自己 ('国内考试') 加进去
        if (node.children) {
            // 如果有儿子，让儿子也全加进来（这也是递归！）
            node.children.forEach((child: treeNode) => collectValues(child));
        }
    };

    if (targetNode !== null) {
        collectValues(targetNode);
    }
    return result; // 最终返回类似 ['国内考试', '高考', '四级', '六级']
}

const WordBook: React.FC = () => {

    const [keyword, setKeyword] = useState('')
    const [filterLevel, setFilterLevel] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentProto, setcurrentProto] = useState<WordItem | null>(null);
    const debouncedKeyWord = useDebounce(keyword, 300);

    const {
        words, loading, handleAdd, handleDelete, handleUpdate,
        handleToggle, handleDragEnd, handleReset,
        handleExport, handleImport
    }   = useWordContext();

    const filterWords = useMemo(() => {
        const lowerKeyword = debouncedKeyWord.trim().toLowerCase();

        // 🌟 核心升级 1：获取当前的白名单数组
        // 如果选了 'all'，直接给个空数组就行，因为下面会拦截。
        const whiteList = filterLevel === 'all' ? [] : getWhiteList(treeData, filterLevel);

        return words.filter(item => {
            // 🌟 核心升级 2：你的 includes 绝杀！
            // 只要这个单词的 level 在我的白名单里，统统放行！
            const isLevelMatch = filterLevel === 'all' || whiteList.includes(item.level);

            const lowerWord = item.en.toLowerCase();
            const isKeywordMath = lowerWord.includes(lowerKeyword) || item.cn.includes(lowerKeyword);

            return isLevelMatch && isKeywordMath;
        })

    }, [words, debouncedKeyWord, filterLevel, treeData]);

    const handleEditClick = (item: WordItem) => {
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
                loading={loading}
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