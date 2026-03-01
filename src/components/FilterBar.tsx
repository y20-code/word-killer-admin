import React from 'react';
import {Card,Input,Radio,Space,Button,TreeSelect, Tree} from 'antd'
import { SearchOutlined } from '@ant-design/icons';


interface Props{
    keyword:string;
    setKeyword:(val:string) => void;
    filterLevel:string;
    setFilterLevel:(val:string) => void;
    onReset: () => void;
}

const FilterBar:React.FC<Props> = ({keyword,setKeyword,filterLevel,setFilterLevel,onReset}) =>{

    const treeData =[
        {
            value:'all',
            title:'全部'
        },
        {
            value:'国内考试',
            title:'国内考试',
            children:[
                {
                    value:'高考',
                    title:'高考'
                },
                {
                    value:'四级',
                    title:'四级'
                },
                {
                    value:'六级',
                    title:'六级',
                },
            ]
        },
        {
            value:'雅思',
            title:'雅思'
        }
    ]
    return (
    <Card 
        style={{marginBottom:20}}
    >
        <Space>
            <Input 
                prefix={<SearchOutlined/>}
                style={{width:200}}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索单词..."
            /> 
            <Radio.Group 
                value={filterLevel} 
                buttonStyle='solid'
                onChange={(e) => setFilterLevel(e.target.value)}>
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="高考">高考</Radio.Button>
                <Radio.Button value="四级">四级</Radio.Button>
                <Radio.Button value="六级">六级</Radio.Button>
                <Radio.Button value="雅思">雅思</Radio.Button>
            </Radio.Group>

            <TreeSelect
                style={{ width: 200 }}
                value={filterLevel}
                treeData={treeData}
                treeDefaultExpandAll
                placeholder="请选择分类"
                // 原生表单组件 (Input, Radio, Checkbox)： 拿值要用 e.target.value 或 e.target.checked。
                // 高级封装组件 (Select, TreeSelect, DatePicker)： 拿值直接拿！onChange={(value) => ...}。
                onChange={(value) => {
                    console.log("当前选中的分类是：", value); // 加上这句打印，方便你调试
                    setFilterLevel(value);
                }}
            />

            <Button onClick={onReset}>重置数据</Button>
        </Space>
    </Card>
    );
};

export default FilterBar;

