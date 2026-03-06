import {Col,Card,Avatar,Typography} from 'antd'

const {Text,Title} = Typography

interface CardProps{
    icon:React.ReactNode;
    title:string;
    value:number|string;
    colorClass: string;

}

export default function StateCard({icon,title,value,colorClass} :CardProps) {
    return (
        <Col xs={24} sm={8}>
            <Card bordered={false} className="custom-card">
                <div className="stat-card-body">
                    <Avatar size={54} className={colorClass} icon={icon} />
                    <div>
                        <Text type="secondary">
                            {title}
                        </Text>
                        <Title level={2}>
                            {value}
                        </Title>
                    </div>
                </div>
            </Card>
        </Col>
    )
}