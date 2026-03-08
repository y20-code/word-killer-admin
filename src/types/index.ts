export interface BaseUser {
    id:string;                  //用户id
    password:string;            //用户密码
    fullName:string;            //昵称
    role:string;                //身份
    createdAt: string;         // 注册时间
    customAvatar: string;      // 自定义头像
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




