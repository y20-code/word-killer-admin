import request from '../utils/request';

// 1. 获取老师名下的班级
export const fetchClasses = async (teacherId: string) => {
  return request.get(`/classes?teacherId=${teacherId}`) as Promise<any[]>;
};

// 2. 获取所有的词书目录
export const fetchWordbooks = async () => {
  return request.get('/wordbooks') as Promise<any[]>;
};

// 3. 根据选中的词书，拉取对应的单词库
export const fetchVocabularies = async (bookId: string) => {
  return request.get(`/vocabularies?bookId=${bookId}`) as Promise<any[]>;
};

// 4. 发射！创建新的作业任务
export const createAssignment = async (assignmentData: any) => {
  // json-server 接收 POST 请求会自动生成 id
  return request.post('/assignments', assignmentData);
};