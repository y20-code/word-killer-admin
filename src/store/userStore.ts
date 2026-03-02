import { create } from 'zustand';
interface UserState {
  currentUser: any;
  // 这是一个动作，用来更新用户信息
  setCurrentUser: (user: any) => void; 
}

export const useUserStore = create<UserState>((set) => ({
  // 1. 初始化的时候，直接从本地存储读取（这样一刷新页面就有数据）
  currentUser: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  
  // 2. 当有人调用这个方法时，同时更新本地存储和全局状态！
  setCurrentUser: (user) => {
    localStorage.setItem('userInfo', JSON.stringify(user)); // 固化到本地
    set({ currentUser: user }); // 通知全网所有组件更新！
  },
}));