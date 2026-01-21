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

        const addedDateCountMap:Record<string,number> ={};

        data.forEach(item => {
            if(levelMap[item.level] !== undefined) {
                levelMap[item.level]++;
            }

            if(item.status === '已背')
                masteredCount++;

            const date = item.addedDate;

             if(addedDateCountMap[date] !== undefined){
                addedDateCountMap[date]++;
            }else{
                addedDateCountMap[date] = 1;
            }
        })

        const pieData = Object.keys(levelMap).map(key => ({
            name:key,
            value:levelMap[key]
        }))

        const last7Days = [];
        const countData = [];

        for(let i = 6 ;i >=0;i--){
            const d = new Date();
            d.setDate(d.getDate() - i);

            const year = d.getFullYear();
            const month =(d.getMonth() + 1).toString().padStart(2,'0')
            const day = d.getDate().toString().padStart(2,'0');
            const dateStr = `${year}-${month}-${day}`;

            last7Days.push(dateStr); 

            countData.push(addedDateCountMap[dateStr] || 0);
        }

        return {pieData,masteredCount,total:data.length,last7Days,countData};

    },[data])

    const levelOption = {
        title:{
            text:'词库构成',
            left:'center',
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
                    borderRadius:10,
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

    const lineChartOption ={
        title:{
            text:'新增单词趋势（近7天）',
            left:'center',
            textStyle:{fontSize:16}
        },
        tooltip:{
            trigger:'axis'
        },
        xAxis:{
            type:'category',
            data:chartData.last7Days,
        },
        yAxis:{
            type:'value',
            minInterval:1
        },
        series:[{
            data:chartData.countData,
            type:'line',
            smooth:true,
            areaStyle:{}
            }]
    };


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
            <Col span={24}> {/* 占满整行 */}
                <Card hoverable style={{ marginTop: 20 }}>
                    <ReactECharts option={lineChartOption} style={{ height: 300 }} />
                </Card>
            </Col>
        </Row>
    );

}

export default StatisticsChart;