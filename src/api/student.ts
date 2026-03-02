import request from '../utils/request';

export const fetchTeacherStudents = async (teacherId: string) => {
  // 1. 获取老师管理的班级
  const classes = await request.get(`/classes?teacherId=${teacherId}`) as any[];
  const classIds = classes.map(c => c.id);

  // 2. 获取所有的学生用户
  const allUsers = await request.get(`/users?role=student`) as any[];
  // 过滤出属于当前老师班级的学生
  const myStudents = allUsers.filter(u => classIds.includes(u.classId));

  // 3. 获取学习日志，用来计算“掌握词汇”数
  const logs = await request.get(`/learning_logs`) as any[];

  // 4. 把原始数据“翻译”成你的 Ant Design 表格能看懂的格式
  const studentData = myStudents.map(student => {
    // 找出这个学生答对的所有记录
    const studentLogs = logs.filter(log => log.studentId === student.id && log.isCorrect);
    
    return {
      key: student.id,
      name: student.fullName || '未命名学生',
      avatar: student.customAvatar, // 使用数据库里的真实头像
      joinDate: student.createdAt.split('T')[0], // 把时间戳切掉，只留 YYYY-MM-DD
      words: studentLogs.length, // 答对了几次，就算掌握了几个词
      stars: studentLogs.length > 5 ? 5 : 3, // 随便定个简单的熟练度规则
      lastActive: '今天', // 日期运算较复杂，这里先统一简化
    };
  });

  return {
    students: studentData,
    totalStudents: studentData.length,
    // 模拟算一个平均进度
    avgProgress: studentData.length > 0 ? 68 : 0, 
  };
};

export const fetchStudentDetail = async (studentId: string) => {
  // 1. 并发请求：学生本人信息、该学生的所有学习记录、全量词库
  const [student, logs, vocabularies] = await Promise.all([
    request.get(`/users/${studentId}`) as Promise<any>,
    request.get(`/learning_logs?studentId=${studentId}`) as Promise<any[]>,
    request.get(`/vocabularies`) as Promise<any[]>
  ]);

  let className = '未知班级';
  if (student.classId) {
    try {
      // json-server 支持直接通过 /classes/c_A01 查单条数据
      const classInfo = await request.get(`/classes/${student.classId}`) as any;
      if (classInfo && classInfo.name) {
        className = classInfo.name;
      }
    } catch (error) {
      console.warn("未能获取到班级名称");
    }
  }

  // 2. 计算顶部统计卡片数据
  const totalLogs = logs.length;
  const correctLogs = logs.filter(log => log.isCorrect);
  const correctCount = correctLogs.length;
  const avgCorrectRate = totalLogs > 0 ? Math.round((correctCount / totalLogs) * 100) : 0;

  // 3. 拼装底部“最近活动”表格数据 (将 log 和 vocabulary 结合)
  // 按时间倒序排列，拿最近的 5 条记录
  const sortedLogs = logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentActivity = sortedLogs.slice(0, 5).map(log => {
    const wordInfo = vocabularies.find(v => v.id === log.wordId) || {};
    return {
      key: log.id,
      word: wordInfo.word || '未知单词',
      meaning: wordInfo.translation || '...',
      difficulty: log.isCorrect ? 'EASY' : 'HARD', // 答对算简单，答错算难
      type: wordInfo.category || '未知',
      mastery: log.isCorrect ? 100 : 30, 
      date: new Date(log.createdAt).toLocaleString(),
    };
  });

  // 4. 模拟图表折线数据 (真实场景需按日期 Group By 统计，这里我们根据总词汇量生成一个增长趋势)
  const chartData = [
    correctCount > 10 ? correctCount - 10 : 0, 
    correctCount > 5 ? correctCount - 5 : 0, 
    correctCount > 2 ? correctCount - 2 : 0, 
    correctCount
  ];

  return {
    info: { ...student, className: className },
    stats: {
      words: correctCount,
      correctRate: avgCorrectRate,
      streak: totalLogs > 0 ? 3 : 0 // 模拟连续打卡天数
    },
    recentActivity,
    chartData
  };
};