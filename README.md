# ⚔️ Word Killer Admin (单词杀手后台)

> 一个基于 React + TypeScript + Ant Design 的高性能单词管理系统。
> 模拟大厂中后台开发流程，具备高性能渲染和极致的用户体验。

## 🛠 技术栈 (Tech Stack)
- **核心框架**: React 18, TypeScript, Vite
- **UI 组件**: Ant Design,ECharts, Dnd-kit
- **性能优化**: React Virtuoso (虚拟列表), useMemo (筛选缓存), useDebounce (搜索防抖)
- **数据管理**: Custom Hooks (useLocalStorage 封装)
- **代码规范**: ESLint, Prettier, Git Commit Standard

## ✨ 已实现功能 (Features)
1. **高性能列表**: 支持 20,000+ 条数据的丝滑滚动 (Virtual Scroll)。
2. **数据持久化**: 刷新页面不丢失数据，自动同步 LocalStorage。
3. **智能搜索**: 支持中英文混合搜索，通过防抖减少计算消耗。
4. **全功能编辑**:
   - 新增：UUID 自动生成，表单校验。
   - 删除：乐观 UI 更新。
   - 修改：支持弹窗回显，无感更新。
5. **极简代码**: 封装 `useLocalStorage` 等 Hook，业务逻辑与 UI 分离。
6. **图表展示**: 用饼图显示词表构成，和掌握率。

## 📂 目录结构 (Structure)
src/
├── components/    # 原子组件 (WordCard, WordForm, EditModal,StatisticsChart)
├── hooks/         # 自定义钩子 (useLocalStorage, useDebounce)
├── types/         # TS 类型定义 (WordItem)
├── utils/         # 工具函数 (mock数据生成)
└── App.tsx        # 主入口