import React from 'react';
import { Tag, Button,Popconfirm} from 'antd';
import { CheckCircleOutlined,ClockCircleOutlined,DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import {type WordItem } from '../types';

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities'

interface Props {
    item:WordItem; 
    onDelete: (id:string) => void;
    onEdit: (item:WordItem) => void;
    onToggle:(id:string) => void;
}

const WordCard:React.FC<Props> =  ({item,onDelete,onEdit,onToggle}) =>{

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({id :item.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // 加点样式：padding 等原有的保持不变
        padding: '12px 20px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fff',
        marginBottom: '8px', // 加点间距方便看拖拽效果
        borderRadius: '4px',
    };

    const getLevelColor = (level: string) => {
        switch(level) {
            case '高考': return 'green';
            case '四级': return 'blue';
            case '六级': return 'purple';
            case '雅思': return 'red';
            default: return 'default';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="word-card-hover"
        >
            <div style={{display:'flex',justifyContent:'space-between',alignItems:"center",gap:12}}>
                <div {...attributes} {...listeners} style={{cursor:'grab'}}>
                    <HolderOutlined/>
                </div>
                <div style={{width:100}}>
                    <div style={{fontSize:'18px',fontWeight:'bold',color:'#1f1f1f'}}>
                        {item.en}
                    </div>

                    <div style={{fontSize:'14px',color:'#8c8c8c',marginTop:'4px'}}>
                        {item.cn}
                    </div>
                </div>
                <div  style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <Tag color={getLevelColor(item.level)}>{item.level}</Tag>

                    
                    {/* 状态显示 */}
                    {item.status === '已背' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} onClick={() => onToggle(item.id)}/>
                    ) : (
                        <ClockCircleOutlined style={{ color: '#faad14', fontSize: '16px' }} onClick={() => onToggle(item.id)}/>
                    )}

                    <Button icon={<EditOutlined/>} onClick={() => onEdit(item)}>编辑</Button>
                    <Popconfirm 
                        title="确定要删除吗？"
                        description={`删除的单词是${item.en}`}
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => onDelete(item.id)}
                        >
                        <Button danger icon={<DeleteOutlined/>}  ></Button>
                    </Popconfirm>
                </div>
            </div>


        </div>
    )
}

export default WordCard;
