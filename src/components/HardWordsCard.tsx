
import {Col,Card,List,Empty,Button,Avatar,Typography} from 'antd'
import { AlertOutlined } from '@ant-design/icons'

const {Text} = Typography;

interface HardWordsProps{
    data:any[]
}

export default function HardWordsCard({data}:HardWordsProps){
    return (
        <Col span={24}>
            <Card 
            title={<><AlertOutlined style={{ color: '#f59e0b' }}/> 昨日高频易错词汇 (建议重点讲解)</>} 
            bordered={false} 
            className="custom-card alert-card"
            >
            <List
                className="alert-list"
                dataSource={data}
                locale={{ emptyText: <Empty description="太棒了！昨天大家都没有背错单词！" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                renderItem={(item: any, index: number) => (
                <List.Item actions={[<Button type="dashed" size="small">一键加入复习任务</Button>]}>
                    <List.Item.Meta 
                    avatar={
                        <Avatar 
                        style={{ 
                            backgroundColor: index < 3 ? '#fee2e2' : '#fef3c7', 
                            color: index < 3 ? '#ef4444' : '#d97706',
                            fontWeight: 'bold'
                        }} 
                        >
                        TOP {index + 1}
                        </Avatar>
                    } 
                    title={<Text strong style={{ fontSize: '18px', color: '#1e293b' }}>{item.word}</Text>} 
                    description={
                        <Text type="danger" style={{ fontSize: '14px' }}>
                        全班共有 <Text strong style={{ fontSize: '16px', color: '#ef4444' }}>{item.count}</Text> 名学生记不住这个单词
                        </Text>
                    } 
                    />
                </List.Item>
                )}
            />
            </Card>
        </Col>  
    )
}