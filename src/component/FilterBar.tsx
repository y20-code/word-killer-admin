import React from 'react';
import {Card,Input,Radio,Space,Button} from 'antd'
import { SearchOutlined } from '@ant-design/icons';


interface Props{
    keyword:string;
    setKeyword:(val:string) => void;
    filterLevel:string;
    setFilterLevel:(val:string) => void;
    onReset: () => void;
}

const FilterBar:React.FC<Props> = ({keyword,setKeyword,filterLevel,setFilterLevel,onReset}) =>{
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

            <Button onClick={onReset}>重置数据</Button>
        </Space>
    </Card>
    );
};

export default FilterBar;

