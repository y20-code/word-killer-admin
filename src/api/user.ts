import request from '../utils/request';

//创建学生账号
export const batchCreateStudents = async (studentsPayload: any[]) => {
  const res = await request.post('/api/v1/users/batch', studentsPayload) as any;
  if (res.code === 200) {
    return res;
  }
  throw new Error(res.msg || '批量录入失败');
};