import {useCallback, useState} from 'react'

interface HistoryState<T> {
    past:T[];
    present:T;
    future:T[];
}

export const useUndo = <T>(initialPresent:T) => {

    const [state,setState] = useState<HistoryState<T>>({
        past:[],
        present:initialPresent,
        future:[],

    })

    //记录最新状态
    const set = useCallback((action:React.SetStateAction<T>) => {
        setState((currentState) => {

            const newPresent = typeof action === 'function'
                ? (action as (prev:T) => T)(currentState.present) : action;

            // 性能优化防御（可选）：如果算出来的新值和老值一模一样，就不产生多余的历史记录
            if (newPresent === currentState.present) {
                return currentState;
            }
            
            return {
                past:[...currentState.past,currentState.present],
                present:newPresent,
                future:[]
            }
        })
    },[])

    //撤销
    const undo = useCallback(() => {
        setState((currentState) => {
            const {past,present,future} = currentState;

            if(past.length === 0) return currentState;

            const previous = past[past.length - 1];

            const newPast = past.slice(0,past.length - 1);

            return {
                past:newPast,
                present:previous,
                future:[...future,present]
            }
        })
    },[]);

    //重做
    const redo = useCallback(() => {
        setState((currentState) => {
            const {past,present,future} = currentState;

            if (future.length === 0) return currentState;

            const next = future[future.length - 1];
            const newFuture = future.slice(0,future.length - 1);

            return {
                past:[...past,present],
                present:next,
                future:newFuture,
            }
        })
    },[])

    const reset = useCallback((newPresent:T) => {
        setState({
            past:[],
            present:newPresent,
            future:[]
        });

    },[])

    return {
        state: state.present,
        set,
        undo,
        redo,
        reset,
        canUndo: state.past.length !== 0,   // 能不能撤销？
        canRedo: state.future.length !== 0  // 能不能重做？
    };
}