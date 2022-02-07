/** start
 * @description 二进制流转Execl
 * @param {string} content 二进制流内容
 * @param {string} fileName Execl表名
 * @returns {file} Execl表格
 */
function exportExecl(content, fileName) {
    if (!content) {
      return false
    }
  
    const blob = new Blob([content], {
      type: 'application/vnd.ms-excel;charset=utf-8' //数据类型
    })
    //非IE下载
    if ('download' in document.createElement('a')) {
      const link = document.createElement('a') //创建a标签
      link.download = fileName // 规定被下载的文件名
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob) //创建Blob对象URL
      if (typeof link.download === 'undefined') {
        //如果下载的超链接目标为undefined，新打开页面
        link.setAttribute('target', '_blank')
      }
      document.body.appendChild(link)
      link.click()
      URL.revokeObjectURL(link.href) //释放URL.createObjectURL 创建的URL对象
      document.body.removeChild(link)
    } else {
      // IE10+下载
      navigator.msSaveBlob(blob, fileName)
    }
  }
  export default exportExecl;