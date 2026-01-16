export type WordLevel = '高考' | '四级' | '六级' | '雅思'

export interface WordItem {
    id:string;
    en:string;
    cn:string;
    level:WordLevel;
    status:'未背' | '已背'
    addedDate: string;
}