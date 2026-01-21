import React, { useRef } from "react";
import { Button } from "antd";
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';

interface Props {
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
}

const FileHeader: React.FC<Props> = ({ onImport, onExport }) => {

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>

            {/* 1. 真正的上传控件 (藏起来 display: none) */}
            <input
                type="file"
                ref={fileInputRef} // 绑上 ref
                style={{ display: 'none' }}
                accept=".json" // 限制只能选 json
                onChange={onImport} // 选完触发导入逻辑
            />

            {/* 2. 导出按钮 */}
            <Button icon={<DownloadOutlined />} onClick={onExport}>
                导出备份
            </Button>

            {/* 3. 导入按钮：点击它 -> 触发 input 的 click */}
            <Button
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
            >
                导入备份
            </Button>
        </div>
    )
}

export default FileHeader;