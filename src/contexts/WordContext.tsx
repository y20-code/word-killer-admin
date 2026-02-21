import {createContext,useContext} from 'react';
import { type WordItem } from '../types';
import { type DragEndEvent } from '@dnd-kit/core';

interface WordContextType {
    words:WordItem[],
    loading:boolean,
    handleAdd:(item:WordItem) => void;
    handleDelete:(id:string) => void;
    handleUpdate:(id:string,item:WordItem) => void;
    handleToggle:(id:string) => void; 
    handleDragSort:(oldIndex:number,newIndex:number) => void;
    handleReset:() => void;
    overwriteWords:(newWords:WordItem[]) => void;
    handleExport: () => void;
    handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDragEnd: (event: DragEndEvent) => void;

    undo:() => void;
    redo:() => void;
    canUndo:boolean;
    canRedo:boolean;
}


export const WordContext = createContext<WordContextType | undefined>(undefined);

export const useWordContext = () =>{
    const context = useContext(WordContext);
    if(!context) {
        throw new Error('useWordContext 必须在WordProvider 内部使用！');
    }

    return context;
}