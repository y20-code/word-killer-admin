import React,{useMemo} from 'react';
import ReactECharts from 'echarts-for-react'
import {Card,Row,Col} from 'antd';
import {type WordItem } from '../types';

interface Props{
    data:WordItem[];
}

const StatisticsChart:React.FC<Props> = ({data}) =>{

    const chartData = useMemo(() =>{

        const levelMap:Record<string,number> = {
            '高考':0,
            '四级':0,
            '六级':0,
            '雅思':0
        }

        let masteredCount = 0;

        data.forEach(item => {
            if(levelMap[item.level] !== undefined) {
                levelMap[item.level]++;
            }

            if(item.status === '已背')
                masteredCount++;
        })

        const pieData = Object.keys(levelMap).map(key => ({
            name:key,
            value:levelMap[key]
        }))

        return {pieData,masteredCount,total:data.length};

    },data)

    const levelOption = {
        title:{
            text:'词库构成',
            left:'cneter',
            textStyle:{fontSize:16}
        },

        tooltip:{trigger:'item'},
        legend:{bottom:'0'},
        series:[
            {
                name:'难度等级',
                type:'pie',
                radius:['40%','70%'],
                avoidLabelOverlap:false,
                itemStyle:{
                    borerRadius:10,
                    borderColor:'#fff',
                    borderWidth:2
                },
                data:chartData.pieData
            }
        ]
    }

    const progressOption = {
        title:{
            text:'掌握率',
            left:'center',
            subtext:`${chartData.masteredCount} / ${chartData.total}`,
            top:'35%'
        },
        series: [
            {
                type: 'pie',
                radius: ['60%', '75%'],
                label: { show: false }, // 不显示标签，只看圈
                data: [
                    { value: chartData.masteredCount, name: '已掌握' },
                    { value: chartData.total - chartData.masteredCount, name: '未背' }
                ]
            }
        ]
    }

    return (
        <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={12}>
                <Card hoverable>
                    {/* 渲染第一个图 */}
                    <ReactECharts option={levelOption} style={{ height: 300 }} />
                </Card>
            </Col>
            <Col span={12}>
                <Card hoverable>
                    {/* 渲染第二个图 */}
                    <ReactECharts option={progressOption} style={{ height: 300 }} />
                </Card>
            </Col>
        </Row>
    );

}

export default StatisticsChart;