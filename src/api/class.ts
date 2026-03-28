import request from '../utils/request';

//获取班级名称
export const fetchMyClasses = async () => {
  const res = await request.get('/api/v1/classes/my') as any;
  if (res.code === 200) {
    return res.data; // 直接返回数组
  }
  return [];
};

//创建班级
export const createNewClass = async (payload: { name: string; currentGrade: string; teacherId?: string }) => {
  const res = await request.post('/api/v1/classes', payload) as any;
  if (res.code === 200) {
    return res.data; // 返回建好的班级信息
  }
  throw new Error(res.msg || '建班失败');
};