console.log("进入到自动打包plugins中。。。。。。。")
const fs = require('fs')
const _path = require('path')
const _LastMdName = 'bable-plugin-demojx-md'
var _LastFileName = 'readme'
var _allMdCache = ''


function resolve(path) {
    return _path.join(__dirname, '.', path)
}

function saveMdFile(name, content) {
    if (!fs.existsSync(resolve(_LastFileName))) {
        fs.mkdirSync(resolve(_LastFileName))
    }
    fs.writeFile(resolve(`${_LastFileName}/${name}.md`), content, function (error) {
        if (error) {
            console.error(error)
        } else {
            console.log('保存文件成功')
        }
    })
}

function buildReadMe(funName, chunks) {
    const TYPEMAP = {
        'string': '字符串',
        'number': '数值',
        'array': '数组',
        'object': '对象',
        'file' : '文件'
    }
    var data = {
        _funName: funName,
        _description: '无',
        _paramStr: '',
        _returns: '无',
        _otherMsg: ''
    }

    const KEYWORDMAPLIST = ['@description', '@param', '@returns']
    const KEYWORDMAP = new Map(Object.entries({
        '@description': function (chunk) {
            console.log("chunk", chunk, /@description(.*)/.exec(chunk)[1])
            let tempDesc = /@description(.*)/.exec(chunk)[1]
            tempDesc.length && (data._description = tempDesc)
            console.log('描述', data._description)
        },
        '@param': function (chunk) {
            let paramChunks = chunk.match(/@param(.*)/)[1].match(/\S+/g)
            console.log(paramChunks)
            paramChunks[0] && (paramChunks[0] = TYPEMAP[paramChunks[0].match(/{(.*)}/)[1].toLowerCase()] || paramChunks[0].match(/{(.*)}/)[1].toLowerCase())
            if (paramChunks.length < 3) {
                data._paramStr += `|${paramChunks[1]}|${paramChunks[0]}|无|` + '\n'
            } else {
                data._paramStr += `|${paramChunks[1]}|${paramChunks[0]}|${paramChunks[2]}|` + '\n'
            }
            console.log('参数', data._paramStr)
        },
        '@returns': function (chunk) {
            let tempRes = /@returns(.*)/.exec(chunk)[1]
            tempRes.length && (data._returns = tempRes)
            console.log('返回', data._returns)
        }
    }))

    for (let i = 1; i < chunks.length; i++) {
        console.log(i, chunks[i])
        var curKeyWord = KEYWORDMAPLIST.find(k => chunks[i].includes(k))
        curKeyWord ? (KEYWORDMAP.get(curKeyWord) && KEYWORDMAP.get(curKeyWord)(chunks[i])) : (data._otherMsg+='\n'+(chunks[i].split('*')[1]||''))
    }

    var tempMd = fs.readFileSync('./readme.temp.md', 'utf-8')
    var pattern = /\$\{([\s\S]+?)\}/g;
    tempMd = tempMd.replace(pattern, function () {
        console.log('设置', data[arguments[1]])
        return data[arguments[1]]
    })
    return tempMd
}

const visitor = {
    name: _LastMdName,
    pre() {
        this.strPart = ''
    },
    visitor: {
        FunctionDeclaration(path) {
            var curNode = path.node
            if (curNode.leadingComments && curNode.leadingComments.length && curNode.leadingComments.some(o => o.type === 'CommentBlock')) {
                var tempName = curNode.id.name;
                var tempCommentChunks = curNode.leadingComments[0].value.split('\n')
                if (!tempCommentChunks[0].includes("start")) return
                this.strPart += buildReadMe(tempName, tempCommentChunks) + '\n'
            }
        },
        VariableDeclaration(path) {
            var varNode = path.node;
            if(varNode.declarations && varNode.declarations[0].init && varNode.declarations[0].init.properties){
                let curNode = varNode.declarations[0].init.properties;
                for(let i = 0; i < curNode.length; i++) {
                    if(curNode[i].leadingComments && curNode[i].leadingComments.length && curNode[i].leadingComments.some(o => o.type === 'CommentBlock')){
                        var tempName = curNode[i].key.name;
                        var tempCommentChunks = curNode[i].leadingComments[0].value.split('\n')
                        if (!tempCommentChunks[0].includes("start")) return
                        this.strPart += buildReadMe(tempName, tempCommentChunks) + '\n'
                    }
                }
            }
        }
    },
    post(state) {
        console.log("state.opts",state.opts)
        let fileName = ''
        let opts = {}
        if(!state.opts.generatorOpts){ // 直接执行label
            fileName = state.opts.sourceMapTarget.split('.')[0]
            opts = state.opts.plugins.find(p => p[0].key === _LastMdName)[1] || {}
        } else {
            fileName = state.opts.generatorOpts.sourceFileName.split('.')[0]
            opts = state.opts.plugins.find(p => p.key === _LastMdName).options
            console.log("opts",opts)
        }
        opts._LastFileName && (_LastFileName = opts._LastFileName)
        if(opts.gather){
            _allMdCache+=this.strPart
            saveMdFile(opts.gather, _allMdCache)
        }else {
            this.strPart.length && saveMdFile(fileName, this.strPart)
        }
    }
}

module.exports = function () {
    return visitor
}