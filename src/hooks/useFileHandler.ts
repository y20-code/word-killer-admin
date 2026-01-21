import { type WordItem } from '../types';
import { message } from 'antd'
export const useFileHandler = (
  words: WordItem[],
  overwriteWords: (data: WordItem[]) => void
) => {

  const handleExport = () => {

    const jsonStr = JSON.stringify(words, null, 2)

    const blob = new Blob([jsonStr], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `word-killer-backup-${new Date().toISOString().split('T')[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();


    reader.onload = (e) => {
      try {
        const result = e.target?.result as string; // 拿到读出来的字符串
        const parseData = JSON.parse(result); // 把字符串变回数组

        if (Array.isArray(parseData)) {
          overwriteWords(parseData);
          message.success('备份导入成功！');
        } else {
          message.error('文件格式不对，必须是单词数组');
        }
      } catch (error) {
        message.error('JSON 解析失败，文件可能损坏');
      }
    };

    reader.readAsText(file);

    event.target.value = '';
  };

  return {
    handleExport,
    handleImport
  }
}