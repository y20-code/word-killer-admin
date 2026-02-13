import React,{useMemo} from "react";

import { Row, Col, Card, Statistic, Progress } from "antd";
import { TrophyOutlined, BookOutlined, RiseOutlined } from '@ant-design/icons';
import StatisticsChart from "../component/StatisTicsChart";
import { type WordItem } from "../types";

interface Props {
    words: WordItem[];
}

const Dashboard: React.FC<Props> = ({ words }) => {

    const stats = useMemo(() => {
        const total = words.length;
        const learned = words.filter(w => w.status === '已背').length;
        const unlearned = total - learned;
        
        const rate = total === 0 ? 0 : Math.round((learned / total) * 100);

        return { total, learned, unlearned, rate };
    }, [words]);

    

    return (
        <div>
            <h2>📊 学习数据仪表盘</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>查看你的学习进度和单词分布</p>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                {/* 第一张卡：总词汇量 */}
                <Col xs={24} sm={8} >
                    <Card bordered={false} hoverable style={{height:150}}>
                        <Statistic 
                            title="单词总储备" 
                            value={stats.total} 
                            suffix="个" 
                            prefix={<BookOutlined />} // 图标
                            valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>

                {/* 第二张卡：已掌握 */}
                <Col xs={24} sm={8}>
                    <Card bordered={false} hoverable style={{height:150}} >
                        <Statistic 
                            title="已掌握单词" 
                            value={stats.learned} 
                            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                            prefix={<TrophyOutlined />}
                        />
                        <div style={{ marginTop: 8 }}>
                            {/* 进度条：status="active" 会有动态光效 */}
                            <Progress percent={stats.rate} strokeColor="#3f8600" size="small" status="active"/>
                        </div>
                    </Card>
                </Col>

                {/* 第三张卡：待攻克 */}
                <Col xs={24} sm={8}>
                    <Card bordered={false} hoverable style={{height:150}}>
                        <Statistic 
                            title="待攻克" 
                            value={stats.unlearned} 
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                            prefix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
            <StatisticsChart data={words} />
        </div>
    )
}

export default Dashboard;