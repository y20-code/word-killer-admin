import {Col,Card,Button,List,Progress,Tag,Empty} from 'antd'
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';



interface ClassProgressProps{
    data:any[];
    onItemClick: (item: any) => void;
}

export default function ClassProgressList({data,onItemClick} : ClassProgressProps) {

    const navigate = useNavigate();

    return (
        <Col span={24}>
              <Card 
                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>各班级昨日作业完成情况 (点击查看详情 🖱️)</span>} 
                bordered={false} 
                className="custom-card"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/classes/create')}>新建班级与录入名单</Button>}
              >
                {data.length > 0 ? (
                    <List
                      dataSource={data}
                      renderItem={item => {
                        const rate = item.value; 
                        const slackersCount = item.slackers.length; 
                        
                        let color = '#ef4444'; 
                        let status: 'exception' | 'success' | 'normal' = 'exception';
                        
                        if (rate >= 80) {
                          color = '#10b981'; 
                          status = 'success';
                        } else if (rate >= 60) {
                          color = '#f59e0b'; 
                          status = 'normal';
                        }

                        return (
                          <List.Item 
                            onClick={() => onItemClick(item)}
                            style={{ 
                                cursor: 'pointer', 
                                padding: '16px 24px', 
                                backgroundColor: '#f8fafc', 
                                marginBottom: 16, 
                                borderRadius: 8, 
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                          >
                            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                              
                              <div style={{ width: '20%', fontSize: '16px', fontWeight: 'bold', color: color }}>
                                {item.name}
                              </div>
                              
                              <div style={{ width: '55%' }}>
                                <Progress percent={rate} strokeColor={color} status={status} strokeWidth={12} />
                              </div>
                              
                              <div style={{ width: '25%', textAlign: 'right' }}>
                                {slackersCount > 0 ? (
                                  <Tag color="error" style={{ fontSize: '15px', padding: '6px 16px', borderRadius: '16px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444' }}>
                                    未完成 {slackersCount} 人
                                  </Tag>
                                ) : (
                                  <Tag color="success" style={{ fontSize: '15px', padding: '6px 16px', borderRadius: '16px', border: 'none', backgroundColor: '#dcfce7', color: '#22c55e' }}>
                                    全员完成 🎉
                                  </Tag>
                                )}
                              </div>

                            </div>
                          </List.Item>
                        );
                      }}
                    />
                ) : (
                    <Empty description="昨日无作业数据" style={{ marginTop: 60, marginBottom: 60 }} />
                )}
              </Card>
            </Col>
    )
}