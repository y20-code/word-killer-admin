/**
 * 将扁平数组转换为树形结构 (List to Tree)
 * * @description
 * 使用 Map 映射实现 O(n) 时间复杂度的转换。
 * 相比传统的递归或双层循环 (O(n^2))，在大数据量（如 1w+ 节点）下性能提升显著。
 * 适用于组织架构、文件目录、思维导图等场景。
 * * @param {Array} items - 后端返回的扁平数组，必须包含 id 和 parentId
 * @returns {Array} 转换后的树形结构数组
 * 
 * 
 */

interface TreeNode {
  id: number;
  parentId: number;
  name: string;
  children: TreeNode[]; // 👈 这一行很关键，它是递归的
  [key: string]: any;   // 允许这棵树里还有别的属性（比如 url, icon 等）
}

export function listToTree(items: any[]) {
  const result:TreeNode[] = [];
  const itemMap:Record<number, TreeNode> = {}; 

  // 1. 初始化 Map 映射，预置 children 容器
  for (const item of items) {
    itemMap[item.id] = { ...item, children: [] };
  }

  // 2. 构建节点关系
  for (const item of items) {
    const id = item.id;
    const parentId = item.parentId;
    const treeNode = itemMap[id];

    if (parentId === 0) {
      // 根节点直接存入结果集
      result.push(treeNode);
    } else {
      // 非根节点，挂载到父节点的 children 中
      // 注意：这里利用了对象引用的特性，无需再次回填
      const parentNode = itemMap[parentId];
      if (parentNode) {
        parentNode.children.push(treeNode);
      }
    }
  }

  return result;
}