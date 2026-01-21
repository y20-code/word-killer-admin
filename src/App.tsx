import { useState, useMemo } from 'react';

import { type DragEndEvent } from '@dnd-kit/core';

import { type WordItem } from './types';

import { WordList, WordForm, EditModal, StatisticsChart, FilterBar, FileHeader } from './component'

import { useDebounce, useWordManager, useFileHandler } from './hooks';

const App = () => {

  const {
    words, handleAdd, handleDelete, handleUpdate,
    handleToggle, handleDragSort, handleReset,
    overwriteWords

  } = useWordManager();

  const { handleExport, handleImport } = useFileHandler(words, overwriteWords);

  const [keyword, setKeyword] = useState('');

  const debouncedKeyWord = useDebounce(keyword, 300)

  const [filterLevel, setFilterLevel] = useState('all')

  const [currentProto, setcurrentProto] = useState<WordItem | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const filterWords = useMemo(() => {

    const lowerKeyword = debouncedKeyWord.trim().toLowerCase();

    return words.filter(item => {
      const isLevelMatch = filterLevel === 'all' || item.level === filterLevel;

      const lowerWord = item.en.toLowerCase();

      const isKeywordMatch = lowerWord.includes(lowerKeyword) || item.cn.includes(lowerKeyword);

      return isLevelMatch && isKeywordMatch;
    })
  }, [words, debouncedKeyWord, filterLevel])


  const handleEditClick = (item: WordItem) => {
    setcurrentProto(item);
    setIsModalOpen(true);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event; // active: 被拖的人, over: 被撞的人

    // 如果 over 存在，且 dragged 确实换了位置
    if (over && active.id !== over.id) {
      // 找到旧位置的索引
      const oldIndex = words.findIndex((item) => item.id === active.id);
      // 找到新位置的索引
      const newIndex = words.findIndex((item) => item.id === over.id);

      // 使用 dnd-kit 提供的 arrayMove 重新排序
      handleDragSort(oldIndex, newIndex)
    }
  };


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

    <FileHeader
      onExport={handleExport}
      onImport={handleImport}
    />

    <WordForm onAdd={handleAdd} />

    <StatisticsChart data={words} />

    <FilterBar
      keyword={keyword}
      setKeyword={setKeyword}
      filterLevel={filterLevel}
      setFilterLevel={setFilterLevel}
      onReset={handleReset}
    />

    <EditModal
      isOpen={isModalOpen}
      currentWord={currentProto}
      onClose={() => setIsModalOpen(false)}
      onUpdate={handleUpdate}
    />

    <WordList
      data={filterWords}
      onDelete={handleDelete}
      onEdit={handleEditClick}
      onDragEnd={handleDragEnd}
      onToggle={handleToggle} />
  </div>)
};

export default App;