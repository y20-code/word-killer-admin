import request from '../utils/request';

export interface CreateVocabularyPayload {
  bookId: string;       // 绑定的词书 ID
  word: string;         // 单词本身
  partOfSpeech: string; // 聚合后的词性
  translation: string;  // 聚合后的中文释义
  example?: string;     // 例句（可选）
}

export const createVocabulary = async (data: CreateVocabularyPayload) => {
  
  const res = await request.post('/api/v1/vocabularies', data) as any;
  
  
  if (res.code === 200) {
    return res; 
  }
  
  throw new Error(res.msg || '录入失败');
};

//获取全部单词
export const fetchAllVocabularies = async () => {
  const res = await request.get('/api/v1/vocabularies/all') as any;
  if (res.code === 200) {
    return res.data;
  }
  return [];
};

export const deleteVocabulary = async (id: string) => {
  const res = await request.delete(`/api/v1/vocabularies/${id}`) as any;
  if (res.code === 200) {
    return res;
  }
  throw new Error(res.msg || '删除失败');
};