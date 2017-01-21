//@Author : Hristijan Antov 
// Read Eval Print <--- Loop
var Repl = (function (_console, commands) {
    // getAllNodes(file_explorer).find(node => node.path === `${Repl.state.basePath}\\${Repl.state.currentPath}`)
    let commandNames = Object.keys(commands)
    let state = {
        currentPath: '',
        basePath: '',
        isActive: false,
        clearScreenOnNextPrint: false,
        nodes: [],
        previousExecutedCommands: [],
        previous: -1
    }


    const inputRow = (path) => `
        <div class="console-input-row">
            <span class="console-path">${path}</span><input type="text" class="console-input">
        </div>`
    const outputTemplate = (output, isError = false) => `
        <pre class="console-output ${isError ? 'stdout-error' : ''}">${output}</pre>`

    const getAllNodes = (node) => {
        let nodes = []
        if (node.type === 'file')
            return node
        if (node.type === 'directory') {
            return [node, ...node.children.map(n => getAllNodes(n))].reduce((flatten, current) => flatten.concat(current), [])
        }
    }

    const up = (stdIn) => stdIn.val(state.previousExecutedCommands[--state.previous])
    const down = (stdIn) => stdIn.val(state.previousExecutedCommands[--state.previous])
    const _print = (output, isError = false) => {

        if (typeof output === 'string') {
            if (isError) {
                _console.append(outputTemplate(util.escape_html(output), isError))
            }
            else {
                if (state.clearScreenOnNextPrint) {
                    state.clearScreenOnNextPrint = false
                    _console.html('<h1 class="terminal-title">Terminal</h1>')
                }
                else {
                    _console.append(outputTemplate(util.escape_html(output)))
                }
            }
        }

        _console.find('.console-input').attr('readonly', 'true');
        _console.append(inputRow('\\' + state.currentPath + ':'))
        _console.find('.console-input')
            .last()
            .focus()
            .keydown(function (key) {
                if (key.which === topArrowIsPressed) {
                    up($(this))
                    return true;
                }
                if (key.which === bottomArrowIsPressed) {
                    down($(this))
                    return true;
                }
                if (key.which !== 13) {
                    return true
                }
                let val = $(this).val()
                state.previousExecutedCommands.push(val)
                state.previous = state.previousExecutedCommands.length - 1
                read(val)
            })
    }


    const read = (input) => {
        input = input.trim()
        if (input.length === 0) {
            _print()
            return false;
        }

        let commandsSequence = input.split('|')
        let commandsQueue = []

        for (let commandText of commandsSequence) {
            let commandAtoms = commandText.trim()
            let tokenizedCommand = util.tokenizeCommand(commandAtoms)
            if (!tokenizedCommand.status) {
                let isError = true
                _print(tokenizedCommand.value, isError)
            }

            let tokens = tokenizedCommand.tokens
            let name = tokens.find(token => token.type === 'command').value
            let params = tokens.filter(token => token.type === 'param').map(param => param.value)
            commandsQueue.push({
                name,
                params
            })

        }
        // Ovoj pipe raboti asinhrono taka da mozeme bukvalno da pravime i http requesti na dadena komanda 
        //i bilo sto ostanato koe ne se znae koga ke zavrsi

        const pipe = (sequence, index = 0) => {
            let outputPromise = evaluate(sequence[index])
            outputPromise.then((output) => {
                if (index + 1 < sequence.length) {
                    sequence[index + 1].params = [output, ...sequence[index + 1].params]
                    pipe(sequence, index + 1)
                }
                else {
                    _print(output)
                }
            })
        }

        pipe(commandsQueue);
        return commandsQueue
    }




    const evaluate = (command) => {
        return commands[command.name](command.params, state)
    }



    const _open = () => {
        state.isActive = true
        state.basePath = file_explorer.path.split('\\').slice(0, 2).join('\\')
        state.currentPath = file_explorer.path.split('\\').slice(2).join('\\')
        state.nodes = getAllNodes(file_explorer)
        state.nodes = state.nodes.map(node => Object.assign({}, node, {
            parent: state.nodes.find(n => n.type === 'directory' && (n.children.find(child => child.id === node.id) != undefined))
        }))
        state.previous = 0
        $('.editor-controller').addClass('console-active')
        $('.console').addClass('isConsoleActive')

        // Koga print se povikuva vaka bez parametri ednostavno go zakacuvame standardniot vlez i labelata za tekovnata pateka
        _print()

    }

    return {
        read,
        evaluate,
        _print,
        commands,
        _open,
        state,
        getAllNodes
    }
})($('.console'), Commands)