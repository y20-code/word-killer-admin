import React from "react";
import StatisticsChart from "../component/StatisTicsChart";
import { type WordItem } from "../types";

interface Props {
    words: WordItem[];
}

const Dashboard: React.FC<Props> = ({ words }) => {
    return (
        <div>
            <h2>📊 学习数据仪表盘</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>查看你的学习进度和单词分布</p>
            <StatisticsChart data={words} />
        </div>
    )
}

export default Dashboard;