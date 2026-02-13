import React,{useState,useMemo} from 'react';


// 假设这是那个 10 万条数据的数组
interface VirtualListProps {
    listData:any[];         // 数据源
    itemHeight:number;      // 每一项固定的高度 (比如 50px)
    containerHeight:number; // 容器高度 (比如 500px)
    bufferCount?: number;   // 缓冲区个数 (默认给 5 个)
}

const VirtualList:React.FC<VirtualListProps> = ({
    listData,
    itemHeight,
    containerHeight,
    bufferCount = 5
}) => {


    const [scrollTop,setScrollTop] = useState(0)

    const {visibleData,totalHeight,offsetY} = useMemo(() =>{
        const totalHeight = listData.length * itemHeight;

        let startIndex = Math.floor(scrollTop / itemHeight) - bufferCount;

        if (startIndex < 0) startIndex = 0

        const visibleCount = Math.ceil(containerHeight / itemHeight);
        let endIndex = startIndex + visibleCount + bufferCount * 2;
        if (endIndex > listData.length) endIndex = listData.length;

        const visibleData = listData.slice(startIndex,endIndex);

        const offsetY = startIndex * itemHeight;

        return {visibleData,totalHeight,offsetY};

    },[scrollTop,listData,itemHeight,containerHeight,bufferCount]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // 这里的 e.currentTarget.scrollTop 就是用户滚动的距离
    // 实际生产中这里通常会加 requestAnimationFrame 节流
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
    // 层级 1：可视区容器 (定高 + overflow)
    <div 
      style={{ height: `${containerHeight}px`, overflow: 'auto', border: '1px solid #ccc' }}
      onScroll={handleScroll}
    >
      {/* 层级 2：幽灵层 (负责把高度撑开到 10万 * 50 = 500万 px) */}
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        
        {/* 层级 3：实际渲染层 (使用 transform 把它推到可视区) */}
        <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%',
            // 🚀 核心：偏移回去！
            transform: `translateY(${offsetY}px)` 
        }}>
          {visibleData.map((item, index) => (
             // 注意：这里要处理好 key，尽量用 item.id
            <div 
              key={item.id || index} 
              style={{ height: `${itemHeight}px`, lineHeight: `${itemHeight}px`, paddingLeft: '10px', borderBottom: '1px solid #eee' }}
            >
              {item.content || `Item ${index}`}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
