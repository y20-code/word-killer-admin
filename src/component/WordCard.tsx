import React from 'react';
import { Tag, Badge } from 'antd';
import { CheckCircleOutlined,ClockCircleOutlined } from '@ant-design/icons';
import {type WordItem } from '../types';

interface Props {
    item:WordItem; 

}

const WordCard:React.FC<Props> =  ({item}) =>{

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
            style={{
                padding:'12px 20px',
                borderBottom:'1px solid #f0f0f0',
                background:'#fff',
                transition:'all 0.3s',
                cursor:'pointer'
            }}
            className="word-card-hover"
        >
            <div style={{display:'flex',justifyContent:'space-between',alignItems:"center"}}>
                <div>
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
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                    ) : (
                        <ClockCircleOutlined style={{ color: '#faad14', fontSize: '16px' }} />
                    )}
                </div>
            </div>


        </div>
    )
}

export default WordCard;
