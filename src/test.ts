interface TreeNode {
  id: number;
  name: string;
  parentId: number | null;
  children?: TreeNode[];
}

function buildTree(list: TreeNode[]): TreeNode[] {
    
    const result:TreeNode[] = [];
    const map: Record<number, TreeNode> = {};

    for(let item of list){
      map[item.id] = {...item,children:[]}
    }

    for(let item of list){
      const parent = map[item.id].parentId;

      if(parent === null){
        result.push(map[item.id])
      }else{
        map[parent].children?.push(map[item.id])
      }
    }

    return result;
}