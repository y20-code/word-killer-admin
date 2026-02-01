import React,{Suspense} from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { type DragEndEvent } from '@dnd-kit/core';
import {Spin} from 'antd';

// import {Dashboard ,WordBook} from './pages'

import AppLayout from './component/AppLayout';


import { useWordManager, useFileHandler } from './hooks';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const WordBook = React.lazy(() => import('./pages/WordBook'));

const App = () => {

  const {
    words, handleAdd, handleDelete, handleUpdate,
    handleToggle, handleDragSort, handleReset,
    overwriteWords

  } = useWordManager();

  const { handleExport, handleImport } = useFileHandler(words, overwriteWords);

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


  return (
    <BrowserRouter>
      <Suspense fallback={
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
            <Spin size='large' tip="系统加载中..."/>
        </div>
      }>
        <Routes>
          <Route path='/' element={<AppLayout/>}>
            <Route index element={<Dashboard words={words} />} />

            <Route path="words" element={
              <WordBook
                words={words}
                handleAdd={handleAdd}
                handleDelete={handleDelete}
                handleUpdate={handleUpdate}
                handleToggle={handleToggle}
                handleReset={handleReset}
                handleDragEnd={handleDragEnd}
                handleExport={handleExport}
                handleImport={handleImport}
              />
            } />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )



};

export default App;