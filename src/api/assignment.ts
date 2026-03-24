import request,{type BaseRes} from '../utils/request';


export interface SimpleClassData {
  id: string;
  name: string;
}

// 1. 获取老师名下的班级
export const fetchClasses = async () => {
  const res = await request.get<BaseRes<SimpleClassData[]>>('/api/v1/assignments/options');

  if(res.code === 200){
    return res.data;
  }

  return [];
};

// 2. 获取所有的词书目录
export const fetchWordbooks = async () => {
  const res = await request.get('/api/v1/wordbooks') as any;
  
  if (res.code === 200) {
    return res.data; // 极其丝滑地剥壳返回
  }
  return [];
};

// 3. 根据选中的词书，拉取对应的单词库
export const fetchVocabularies = async (bookId: string) => {
  const res = await request.get(`/api/v1/vocabularies?bookId=${bookId}`) as any;
  
  if (res.code === 200) {
    return res.data; // 极其丝滑地剥壳返回
  }
  return [];
};


export const createAssignment = async (assignmentData: any) => {
  return request.post('/api/v1/assignments', assignmentData);
};