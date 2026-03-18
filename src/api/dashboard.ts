import { data } from 'react-router-dom';
import request,{type BaseRes} from '../utils/request';
import axios from 'axios';

export interface HardWordData {
    word: string;
    count: number;
}

export interface DashboardStatsData {
    activeClassCount: number;
    pendingAssignmentCount: number;
    avgCorrectRate: number;
    hardWords:HardWordData[];
}

export interface ClassProgressData {
  name: string;
    value: number;
    hasAssignment: boolean;
    statDate: string;
    slackers: {
        id: string;
        name: string;
        progress: number;
    }[];
}

export const fetchDashboardData = async (teacherId: string) => {


  let topStats:DashboardStatsData = {activeClassCount:0,pendingAssignmentCount:0,avgCorrectRate:0,hardWords:[]};

  try{
    const res = await request.get<BaseRes<DashboardStatsData>>("/api/v1/dashboard/stats");

    if(res.code === 200){
      topStats = res.data;
    }
  }catch(error){
    console.error("呼叫真实后端失败，请检查 Spring Boot 是否启动", error)
  }


  let chartData: ClassProgressData[] = [];

  try{
    const res = await request.get<BaseRes<ClassProgressData[]>>("/api/v1/dashboard/class-progress");
    if(res.code ===200) {
      chartData = res.data;
    }
  }catch(error){
    console.error("班级进度大盘数据拉取失败", error)
  }

  
  return {
    activeClassCount: topStats.activeClassCount,
    pendingAssignmentCount:topStats.pendingAssignmentCount,
    avgCorrectRate:topStats.avgCorrectRate,
    chartData, 
    hardWords:topStats.hardWords // 👈 传出最新出炉的易错词榜单！
  };
};
