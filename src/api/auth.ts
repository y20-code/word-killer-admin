import request from '../utils/request';

export const registerUser = (userData: any) => {
    return request.post('/users', userData);
};

export const loginUser = (email: string, password: string) => {
    // 这会在 db.json 里寻找匹配 email 和 password 的记录
    return request.get('/users');
};

export const checkEmailExists = (email: string) => {
    return request.get(`/users?email=${email}`);
};

export const updateUser = (id: string, updateData: any) => {
    return request.patch(`/users/${id}`, updateData);
};