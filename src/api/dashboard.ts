import request from '../utils/request';

export const fetchDashboardData = async (teacherId: string) => {
  // 1. 获取老师管理的班级
  const classes = await request.get(`/classes?teacherId=${teacherId}`) as any[];
  const classIds = classes.map(c => c.id);

  // 2. 并发拉取所有的底层数据
  const [allStudents, allAssignments, allRecords, allWords] = await Promise.all([
    request.get(`/users?role=student`) as Promise<any[]>,
    request.get(`/assignments`) as Promise<any[]>,
    request.get(`/student_task_records`) as Promise<any[]>,
    request.get(`/student_words`) as Promise<any[]>
  ]);

  // 3. 过滤出属于当前老师的数据
  const myStudents = allStudents.filter(u => classIds.includes(u.classId));
  const studentIds = myStudents.map(s => s.id);
  const myAssignments = allAssignments.filter(a => classIds.includes(a.classId));
  const myRecords = allRecords.filter(r => studentIds.includes(String(r.studentId)));
  const myWords = allWords.filter(w => studentIds.includes(String(w.studentId)));

  // --- 🌟 计算顶部 3 个数据卡片 ---
  const activeClassCount = classes.length;
  const pendingAssignmentCount = myAssignments.length;

  let totalCorrect = 0;
  let totalAnswers = 0;
  myWords.forEach(w => {
    totalCorrect += w.correctCount || 0;
    totalAnswers += (w.correctCount || 0) + (w.wrongCount || 0);
  });
  const avgCorrectRate = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

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
    activeClassCount,
    pendingAssignmentCount,
    avgCorrectRate,
    chartData, 
    recentAssignments, 
    hardWords // 👈 传出最新出炉的易错词榜单！
  };
};
