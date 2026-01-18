import {useState,useEffect} from 'react';

export const useLocalStorage = <T>(key:string,initialValue:T) => {

    const [storedValue,setStoredValue] = useState<T>(() => {
        try{
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log("读取缓存失败:",error);
            return initialValue;
        }
    });



    useEffect(() => {
        try {
            window.localStorage.setItem(key,JSON.stringify(storedValue));
        } catch (error){
            console.error("写入缓存失败:",error)
        }
    },[key,storedValue])

    return [storedValue,setStoredValue] as const;
}