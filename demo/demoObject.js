let util = {
    /** start
     * @description 通过数组建造树形结构
     * @param {array} array 数组
     * @param {string} id_key 树形ID键名
     * @param {string} parentId_key 树形父级ID键名
     * @returns {array} 树形结构
     */
    buildTree: function(array, parentId_key, id_key){
        array.forEach((element) => {
            if(element[parentId_key] !== 0){
                array.forEach((ele) => {
                    if(ele[id_key] == element[parentId_key]){
                        if(!ele.children){
                            ele.children = [];
                        }
                        ele.children.push(element);
                    }
                });
            }
        });
        return array.filter((ele) => ele[parentId_key] === 0);
    },
    /** start
     * @description 复制文本
     * @param {string} id 复制节点的id
     * @returns {string} 需要复制的文本内容
     */
     copyText: function (id){
        let range = document.createRange();
        let copytxt = document.getElementById(id);
        range.selectNodeContents(copytxt);
        let selection = document.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("Copy");
      }
}
export default util;