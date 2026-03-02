import request from '../utils/request';

export const fetchDashboardData = async (teacherId: string) => {
  try {
    // 2. 🏆 不需要再写 localhost:3000 了，因为 request.ts 里已经配置了 baseURL
    const [classes, assignments, logs] = await Promise.all([
      request.get(`/classes?teacherId=${teacherId}`)as Promise<any[]>,
      request.get(`/assignments`) as Promise<any[]>,
      request.get(`/learning_logs`) as Promise<any[]>
    ]);

    // 3. 🏆 致命细节大修：因为拦截器里写了 return response.data，
    // 所以这里的 classes 已经是数组了，千万不要再写 classesRes.data！
    
    // 下面的数据清洗逻辑一字不改
    const classIds = classes.map((c: any) => c.id);
    const teacherAssignments = assignments.filter((a: any) => classIds.includes(a.classId));
    
    const totalLogs = logs.length;
    const correctLogs = logs.filter((log: any) => log.isCorrect).length;
    const avgCorrectRate = totalLogs > 0 ? Math.round((correctLogs / totalLogs) * 100) : 0;

    const chartData = classes.map((cls: any) => {
       const clsAssignments = teacherAssignments.filter((a:any) => a.classId === cls.id);
       const mockProgress = clsAssignments.length > 0 ? 85 : 0; 
       
       return {
           name: cls.name,
           value: mockProgress,
           itemStyle: { color: mockProgress > 80 ? '#1677ff' : '#94a3b8' } 
       };
    });

    return {
      activeClassCount: classes.length,
      pendingAssignmentCount: teacherAssignments.length,
      avgCorrectRate: avgCorrectRate,
      chartData: chartData.length > 0 ? chartData : [{ name: '暂无班级', value: 0 }]
    };

  } catch (error) {
    // 因为你在 request.ts 里已经做了全局的 message.error 提示，
    // 这里其实连 console.error 都可以省了，交给全局处理就行！
    console.error("获取大盘数据失败:", error);
    throw error;
  }
};