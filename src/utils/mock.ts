import type{ WordItem, WordLevel } from "../types";
import { getTodayStr } from "../utils";


const level = ['高考','四级','六级','雅思'] as const
export const generateWords = (count:number):WordItem[] => {

    const result:WordItem[] = []
    for(let i = 0;i < count;i++){
        
        const randomEn = Math.random().toString(36).substring(7);
        const randomLeveIndex = Math.floor(Math.random() * level.length)
        const randomLevel =  level[randomLeveIndex]

        
        const word:WordItem = {
            id:i.toString(),
            en:`word_${randomEn}`,
            cn:`模拟数据${i}`,
            level:randomLevel,
            status:'未背',
            addedDate:getTodayStr()
        };

        result.push(word)
    }

    return result;
}