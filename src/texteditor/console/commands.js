var Commands = {
    curl : (params,state) => {
        let url = params[0]
        return fetch(url).then(res => res.json()).then(data => JSON.stringify(data))
    },
    json : (params , state) => {
        
        const isArray = (_) => [_.map, _.reduce, _.length != undefined].every(predicate => predicate)
        const spaces = (n) => ' '.repeat(n)
        const types = {
            NUMBER: 'number',
            ARRAY: 'array',
            OBJECT: 'object',
            STRING: 'string',
            BOOLEAN: 'boolean'
        }

        const getType = (node) => {
            if (isArray(node)) {
                return types.ARRAY
            }

            if (typeof node === types.NUMBER) {
                return types.NUMBER
            }

            if (typeof node === types.STRING) {
                return types.STRING
            }

            if (typeof node === types.BOOLEAN) {
                return types.BOOLEAN
            }

            if (typeof node === types.OBJECT) {
                return types.OBJECT
            }
        }

        const format = (node, indent = 4) => {
            let template = ''
            let type = getType(node)

            if (type === types.OBJECT) {
                template += '{' + '\n'
                template += Object.keys(node).map((key) => {
                    let childNode = node[key]
                    return `${spaces(indent)}${key}: ${format(childNode, indent + 4)}`
                }).join(',\n')

                template += '\n' + spaces(indent - 4) + '}'
                return template;
            }

            if (type === types.ARRAY) {
                template += '[' + '\n'
                template += node.map(childNode => spaces(indent) + format(childNode, indent + 4)).join(',\n')
                template += '\n' + spaces(indent - 4) + ']'
                return template
            }

            if (type === types.STRING) {
                return `"${node}"`
            }
            if (type === types.NUMBER) {
                return `${node}`
            }
            if (type === types.BOOLEAN) {
                return `${node}`
            }
        }
        return Promise.resolve(format(JSON.parse(params[0]))) },
    
    
    
    
    
    cd : (params,state) => { 
        let path = params[0]
        let originalPath = util.resolvePath(path,state) 
        let node = state.nodes.find(node => node.path === originalPath)
        state.currentPath = node.path.split('\\').slice(2).join('\\') 
        return Promise.resolve('')
    }, 
    ls : (params,state) => { 
        let path = params[0] || '.'
        let originalPath = util.resolvePath(path,state) 
        let node = state.nodes.find(node => node.path === originalPath)
        if (node.type === 'directory') {
            let columns = node.children.map(n => [n.id,n.birthtime,n.name]) 
                columns = [['NODE ID','BIRTHTIME','NAME']].concat(columns)
                console.log(columns)
            let _table = Drawing.drawTable(util.reverseMatrix(columns))
            return Promise.resolve(_table.map(row => row.join('')).join('\n') + `\nTotal: ${node.children.length}` )
        }
        return Promise.resolve('')
    },
    cat : (params,state) => {
        let path = params[0]
        let originalPath = util.resolvePath(path,state ,true) 
        let node = state.nodes.find(node => node.path === originalPath)
        return Promise.resolve(node.content)
    },
    tree : (params,state) => { 
        let path = params[0] || '.'
        let originalPath = util.resolvePath(path,state) 
        let node = state.nodes.find(node => node.path === originalPath)  
 
        const getIndentation = (howMuch,isLast,hasChildren) => {
            let dashes = (howMuch / 3 - 1)  
            let lastDash = isLast ? '╰───' : '├───'
            if (hasChildren) 
                lastDash = '├───╮'
            return (dashes === 0) ? '' : ('|'.repeat(dashes).split('').join('   ').slice(1) + '   ' + lastDash)
        }  
        const recursivelyGenerateTree = (Node , indent = 3, isLast = false) => { 
            return getIndentation(indent,isLast,Node.children !== undefined && Node.children.length !== 0) + 
                Node.name + '\n' + ((Node.type === 'file') ? '' : 
                Node.children.map((child,i) => recursivelyGenerateTree(child,indent + 3, i === Node.children.length - 1)).join(''))
        }

        return Promise.resolve(recursivelyGenerateTree(node))
    },
    clear: (params,state) => {
        state.clearScreenOnNextPrint = true 
        return Promise.resolve('')
    },
    add : (params,state) => {
        let values = params.map(param => parseInt(param))
        // console.log(values);
        return Promise.resolve(values.reduce((sum , val) => sum + val,0).toString())
    },
    grep : (params,state) => {
        let text  = params[0]
        let regex = new RegExp(params[1])
        let lines = text.split('\n')
        return Promise.resolve(lines.filter(line => regex.test(line)).join('\n'))
    },
    echo : (params,state) => {
        return Promise.resolve(params[0])
    }
}
 