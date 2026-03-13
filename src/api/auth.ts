import request from '../utils/request';

export interface RegisterData {
    loginAccount: string;
    password: string;
    role: string;
}

export const registerUser = (userData: RegisterData) => {
    return request.post('/api/v1/users/register', userData);
};

export const loginUser = (loginAccount: string, password: string) => {
    // 这会在 db.json 里寻找匹配 email 和 password 的记录
    return request.post('/api/v1/users/login',{
        loginAccount,
        password
    });
};

export const checkEmailExists = (email: string) => {
    return request.get(`/users?email=${email}`);
};

export const updateUser = (id: string, updateData: any) => {
    return request.patch(`/users/${id}`, updateData);
};