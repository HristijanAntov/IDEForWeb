const util = (function() {
    const range = (from,to) => Array.from(new Array(to - from) , (_,i) => i + from)
    const isArray = (_) => [_.map, _.reduce, _.length !== undefined ].every(predicate => predicate)
    const unwrap = (wrappedString) => (wrappedString.startsWith("'") && wrappedString.endsWith("'")) ? wrappedString.substring(1 , wrappedString.length - 1) : wrappedString;
    const reverseMatrix = (matrix) => {
        let inversed = []
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                inversed[j] = [].concat(inversed[j])
                inversed[j][i] = matrix[i][j]
            }
        }
        return inversed;
    }
    const escape_html = (tag) => { 
        tag = tag.replace(/</g,"&lt");
        tag = tag.replace(/>/g,"&gt");
        return tag;
    }
    const tokenizeCommand = (input) => {
        let current = 0
        let tokens = []
        let validCommands = Object.keys(Commands) 
        let types = {
            command: 'command',
            space: 'space',
            param: 'param'
        }

        const isSpace = /\s/
        const isStrDelimiter = /\'/
        const isStrDoubleDelimiter = /\"/
        const regularStr = /[a-zA-Z0-9\-\@\.\\,\/,\^]/

        let commandName = input.split(isSpace)[0]
        if (!validCommands.includes(commandName))  {
            let status = false
            let value = `The term '${commandName}' is not recognized as a valid command name`
            return { status , value }
        }

        tokens.push({
            type: types.command,
            value: commandName
        }) 
        current += commandName.length 

        while (current < input.length) { 
            let char = input[current] 
            if (isSpace.test(char)) {
               tokens.push({
                   type: types.space,
                   value: char
               })
               current += 1
               continue;
            }

            if (isStrDelimiter.test(char)) {
                current += 1
                char = input[current]
                let value = ''
                while (!isStrDelimiter.test(char) && current < input.length) {
                    value += char 
                    current += 1
                    char = input[current]
                }
                current += 1
                tokens.push({
                    value,
                    type: types.param
                })
                continue;
            }
            if (isStrDoubleDelimiter.test(char)) {
                current += 1
                char = input[current]
                let value = ''
                while (!isStrDoubleDelimiter.test(char) && current < input.length) {
                    value += char 
                    current += 1
                    char = input[current]
                }
                current += 1
                tokens.push({
                    value,
                    type: types.param
                })
                continue;
            }
            if (regularStr.test(char)) { 
                let value = ''
                while(regularStr.test(char) && current < input.length) {
                    value += char
                    current += 1
                    char = input[current]
                }
                tokens.push({
                    value,
                    type: types.param
                })
                continue;
            }

            let status = false
            let value = `The character'${char}' is not a valid token`
            return { status , value }
        }

        let status = true
        

        return {status,tokens}
    }

    
    const isAbsolutePath = (path) => path.startsWith('\\')
    const resolvePath = (path , state, isSearchingFile = false) => { 
        if (isAbsolutePath(path)) {
            return [state.basePath , path ].join('')
        }
        let parentDelimiter  = '..'
        let currentDelimiter = '.'
        let nodes = state.nodes 
        let currentPath = [state.basePath , state.currentPath ].join('\\')
        let currentNode = nodes.find(node => node.path === currentPath)
        let path_nodes = path.split('\\')
        let index = 0
        for (let currentTraversedPath of path_nodes) { 
            if (currentTraversedPath === currentDelimiter) continue;
            if (currentTraversedPath === parentDelimiter) {
                currentNode = nodes.find(node => node.id === currentNode.id).parent  
                continue;
            }

            let children = currentNode.children
            currentNode = children.find(child => child.name === currentTraversedPath)
            if (isSearchingFile && index === path_nodes.length - 1) {
                return currentNode.path
            }
            
            index++
        }
      
         
        return currentNode.path

    }
    return {  
        escape_html,
        reverseMatrix,
        tokenizeCommand,
        resolvePath,
        range,
        isArray,
        unwrap
    }
})()

