import request from '../utils/request';

export const fetchReportData = async (teacherId: string) => {
  // 1. 并发拉取核心数据
  const [logs, users, vocabularies, classes] = await Promise.all([
    request.get('/learning_logs') as Promise<any[]>,
    request.get('/users?role=student') as Promise<any[]>,
    request.get('/vocabularies') as Promise<any[]>,
    request.get('/classes?teacherId=${teacherId}') as Promise<any[]>
  ]);

  const teacherClassIds = classes.map(c => c.id);
  const myStudents = users.filter(u => teacherClassIds.includes(u.classId));
  const myStudentIds = myStudents.map(s => s.id);
  const myLogs = logs.filter(l => myStudentIds.includes(l.studentId));

  // --- 逻辑 1：计算 KPI ---
  const total = myLogs.length;
  const corrects = myLogs.filter(l => l.isCorrect).length;
  const avgAccuracy = total > 0 ? ((corrects / total) * 100).toFixed(1) : "0";

  // --- 逻辑 2：计算高频错误词 (大数据分析核心) ---
  const errorMap: Record<string, number> = {};
  myLogs.filter(l => !l.isCorrect).forEach(l => {
    errorMap[l.wordId] = (errorMap[l.wordId] || 0) + 1;
  });

  const topErrors = Object.entries(errorMap)
    .sort((a, b) => b[1] - a[1]) // 按错误次数降序
    .slice(0, 5)
    .map(([wordId, count]) => {
      const v = vocabularies.find(item => item.id === wordId) || {};
      return {
        key: wordId,
        word: v.word || '未知',
        meaning: v.translation || '',
        count: count,
        mastery: Math.max(0, 100 - count * 10) // 模拟掌握度：错误越多越低
      };
    });

  // --- 逻辑 3：生成排行榜 ---
  const leaderBoard = myStudents.map(s => {
    const sLogs = myLogs.filter(l => l.studentId === s.id);
    const sCorrects = sLogs.filter(l => l.isCorrect).length;
    return {
      key: s.id,
      name: s.fullName || s.email,
      class: classes.find(c => c.id === s.classId)?.name || '未知班级',
      vocab: sCorrects,
      accuracy: sLogs.length > 0 ? ((sCorrects / sLogs.length) * 100).toFixed(1) : "0",
      avatar: s.customAvatar,
      badges: sCorrects > 10 ? ['award', 'flame'] : ['award']
    };
  }).sort((a, b) => Number(b.vocab) - Number(a.vocab)).slice(0, 5)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    kpi: { avgAccuracy, totalWords: corrects },
    topErrors,
    leaderBoard
  };
};