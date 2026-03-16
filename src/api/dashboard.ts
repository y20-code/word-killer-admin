import { data } from 'react-router-dom';
import request,{type BaseRes} from '../utils/request';
import axios from 'axios';

export interface DashboardStatsData {
    activeClassCount: number;
    pendingAssignmentCount: number;
    avgCorrectRate: number;
}

export const fetchDashboardData = async (teacherId: string) => {


  let topStats = {activeClassCount:0,pendingAssignmentCount:0,avgCorrectRate:0};

  try{
    const res = await request.get<BaseRes<DashboardStatsData>>("/api/v1/dashboard/stats");

    if(res.code === 200){
      topStats = res.data;
    }
  }catch(error){
    console.error("呼叫真实后端失败，请检查 Spring Boot 是否启动", error)
  }

  // 1. 获取老师管理的班级
  const classesRes = await axios.get(`http://localhost:3002/classes?teacherId=${teacherId}`);
  const classes = classesRes.data as any[];; // 原生 axios 需要手动 .data 剥壳
  const classIds = classes.map(c => c.id);

  // 2. 并发拉取所有的底层数据
  const [allStudentsRes, allAssignmentsRes, allRecordsRes, allWordsRes] = await Promise.all([
    axios.get(`http://localhost:3002/users?role=student`),
    axios.get(`http://localhost:3002/assignments`),
    axios.get(`http://localhost:3002/student_task_records`),
    axios.get(`http://localhost:3002/student_words`)
  ]);

  const allStudents = allStudentsRes.data as any[];;
  const allAssignments = allAssignmentsRes.data as any[];;
  const allRecords = allRecordsRes.data as any[];;
  const allWords = allWordsRes.data as any[];;

  // 3. 过滤出属于当前老师的数据
  const myStudents = allStudents.filter(u => classIds.includes(u.classId));
  const studentIds = myStudents.map(s => s.id);
  const myAssignments = allAssignments.filter(a => classIds.includes(a.classId));
  const myRecords = allRecords.filter(r => studentIds.includes(String(r.studentId)));
  const myWords = allWords.filter(w => studentIds.includes(String(w.studentId)));



  // --- 🌟 计算今日安排 (取最近布置的 3 个作业) ---
  const recentAssignments = [...myAssignments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(a => {
        const cls = classes.find(c => c.id === a.classId);
        const timeStr = new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
            id: a.id,
            time: timeStr,
            title: a.title,
            desc: `${cls?.name || '未知班级'} - ${a.targetGrade}词汇`
        };
    });

  // ==================== 🌟 核心新增：高频易错词汇统计（算多少人不会） ====================
  // 刚才的 alerts 逻辑已经被我们彻底干掉了，这里是全新的数据教研核心！
  const hardWordsMap: Record<string, Set<string>> = {};

  myWords.forEach(w => {
    // 只要有错题记录，就把它抓出来
    if (Number(w.wrongCount) > 0) {
      if (!hardWordsMap[w.word]) {
        hardWordsMap[w.word] = new Set(); // 用 Set 防止同一个学生错多次被重复计算
      }
      hardWordsMap[w.word].add(String(w.studentId)); // 记录“谁”不会这个词
    }
  });

  // 转换为数组，按“不会的人数”从高到低排序，只取前 5 名最惨烈的词！
  const hardWords = Object.keys(hardWordsMap).map(word => ({
    word: word,
    count: hardWordsMap[word].size
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);
  // ====================================================================================

  // --- 🌟 计算昨日未通关名单及完成率 (给中间的进度条列表用) ---
  // 取统计日期：平日看昨天，周一回看上周五
  const statDate = new Date();
  const todayWeekday = statDate.getDay(); // 0-6, 周日=0
  const delta = todayWeekday === 1 ? 3 : 1; // 周一 -> 看周五
  statDate.setDate(statDate.getDate() - delta);
  const statDateStr = statDate.toDateString();

  const yesterdayAssignments = myAssignments.filter(a => 
    new Date(a.createdAt).toDateString() === statDateStr
  );

  const chartData = classes.map(cls => {
    const clsAssignments = yesterdayAssignments.filter(a => a.classId === cls.id);
    const clsStudents = myStudents.filter(s => s.classId === cls.id);
    
    const slackers: any[] = [];
    const hasAssignment = clsAssignments.length > 0;

    if (hasAssignment) {
      clsStudents.forEach(stu => {
        let currentProgress = 100;
        let finishedAll = true;

        const studentAssignments = clsAssignments.filter(a => a.targetGrade === stu.grade);
        if (studentAssignments.length > 0) {
          studentAssignments.forEach(assign => {
            const record = myRecords.find(r => String(r.assignmentId) === String(assign.id) && String(r.studentId) === String(stu.id));
            if (!record || Number(record.progress) < 100) {
              finishedAll = false;
              currentProgress = record ? Number(record.progress) : 0;
            }
          });

          if (!finishedAll) {
            slackers.push({ id: stu.id, name: stu.fullName, progress: currentProgress });
          }
        }
      });
    }

    const totalStudents = clsStudents.length;
    let completionRate = 0;
    if (hasAssignment && totalStudents > 0) {
      completionRate = Math.round(((totalStudents - slackers.length) / totalStudents) * 100);
    }

    return { 
      name: cls.name, 
      value: completionRate, 
      slackers: slackers,
      hasAssignment,
      statDate: statDateStr
    };
  });

  return {
    activeClassCount: topStats.activeClassCount,
    pendingAssignmentCount:topStats.pendingAssignmentCount,
    avgCorrectRate:topStats.avgCorrectRate,
    chartData, 
    recentAssignments, 
    hardWords // 👈 传出最新出炉的易错词榜单！
  };
};
