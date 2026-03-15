export interface BaseUser {
    id:string;                  //用户id
    password:string;            //用户密码
    fullName:string;            //昵称
    role:string;                //身份
    createdAt: string;         // 注册时间
    customAvatar: string;      // 自定义头像
    token:string;
}

export interface TeacherInfo extends BaseUser {
    role:'teacher';             //身份
    email:string;               //邮箱
    title:string;               //头衔
    institutionId:string;       //机构代码
}

export interface StudentInfo extends BaseUser {
    role:'student';             //创建时间
    classId:string;             //班级id
    grade:string;               //年级
}


export interface ClassInfo{
    id:string;                  //班级id
    name:string;                //班级名称
    teacherId:string;           //老师id
    inviteCode:string;          //邀请码
    createdAt:string;           //创建时间
}

export interface TaskInfo{
    id:number;                  //任务id
    studentId:string;           //学生d
    assignmentId:string;        //任务id  
    progress:number;            //进度百分比
    duration:number;            //用时
    updatedAt?:string;          //最后更新时间
    completedAt?:string;         //彻底交卷时间
}

export interface WordRecord {
    id: number;
    studentId: string;
    wordId: number;        // 注意：这里是数字！
    word: string;
    correctCount: number;
    wrongCount: number;
    lastTestedAt?: string; // 最后测试时间（加上问号防守一下）
}




