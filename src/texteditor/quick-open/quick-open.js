var quickOpen = (function($quickOpenElement) {
    const state = {
        classes: {
            active_result: 'active-result',
            hidden_quickbox: 'quick-open-disappear-smoothly'
        },
        elements: {
            $search: $('#quick-search-box'),
            $results: $quickOpenElement.find('.quick-results ul')
        },
        templates: {
            result: (name , path , isActive) => `
            <li class="result ${isActive ? 'active-result' : ''}">
                <span class="found-result-name">${name}</span>
                <span class="found-result-path">${path}</span>
            </li> 
            `,
            match_token: (token) => `<span class="quick-result-match-token">${ token }</span>`
        },
        escaped_regex: (pattern) => new RegExp(pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),'gi'),
        selected: undefined,
        results: [],
        query: '',
        checkDirty : NaN,
        ms: 50
    };

    const parsePath = (filePath , query , { escaped_regex , templates } = state) => {
        filePath = filePath.split('\\').slice(2).join('\\')
        filePath = filePath.replace(escaped_regex(query),templates.match_token(query))
        return filePath
    }
    const parseName = (fileName , query , { escaped_regex , templates } = state) =>  {

        fileName = fileName.split('.').slice(0 , -1).join('.')
        fileName = fileName.replace(escaped_regex(query),templates.match_token(query))
        return fileName
    }
    const getAllFiles = (node , files = []) => {
        if (node.type === 'directory') 
            node.children.forEach(child => child.type === 'file' ? files.push(child) : getAllFiles(child,files))
        
        return files
    }
     
    const initState = () => Object.assign(state,{
        selected: undefined,
        results: [],
        query: ''
    })

    const hide = () => { 
        $quickOpenElement.addClass(state.classes.hidden_quickbox)
        initState()
        clearInterval(state.checkDirty)
        state.elements.$search.val('')
    }
    const show = (ProjectTree) => { 
        state.results = getAllFiles(ProjectTree).map((r,i) => Object.assign({},r , {
            isSelected: (i === 0) ? true : false 
        }))
        state.selected = state.results[0]
        render()

        state.checkDirty = setInterval(() => {
            watchForChanges()
        } , state.ms)


        $quickOpenElement.removeClass(state.classes.hidden_quickbox);
        state.elements.$search.focus()
    } 
    const up = ({ results , selected } = state) => {
         
        let indexOfActiveElement = results.findIndex(r => r.id === selected.id ) 
        let total = results.length
        let next = indexOfActiveElement - 1

        if (next < 0) {
            next = total - 1
        }

        console.log(next)
        state.selected = results[ next ]
        state.results = results.map((r,i) => Object.assign({} , r , {
            isSelected: (i === next) ? true : false 
        }));
    }
    const down = ({ results , selected } = state) => {
        let indexOfActiveElement = results.findIndex(r => r.id === selected.id ) 
        let total = results.length
        let next = indexOfActiveElement + 1

        if (next === total) { next = 0 }

        console.log(next)
        state.selected = results[ next ]

        state.results = results.map((r,i) => Object.assign({} , r , {
            isSelected: (i === next) ? true : false 
        }));  
    }

    const render = ({ results , selected , query } = state) => {  
        state.elements.$results.html(
            results.map((file , i) => state.templates.result(parseName(file.name , query) , parsePath(file.path , query) , file.isSelected ? true : false)).join('')
        )
    }
  

    const search = ( files , { query } = state) => {
        if (query === '')
            return files
        let filtredFiles = files.filter(file => {
            let r = file.path.toLowerCase().indexOf(query) > -1
            console.log(r,query)
            return r
        }) 
        return filtredFiles 
    }
    
    const watchForChanges = ({results , selected} = state) => {
        let indexOfActiveElement = results.findIndex(r => r.id === selected.id ) 
        state.query = state.elements.$search.val().toLowerCase()
        state.results = search(getAllFiles(file_explorer)).map((r,i) => Object.assign({},r , {
            isSelected: (i === indexOfActiveElement) ? true : false
        }))
        if (state.results.length !== 0)
            render()
     
     }

    $(state.elements.$search).keydown(function(event) {
        let key = event.which
        if (key === topArrowIsPressed) {
            up()
            render()
            return false  
        }
        if (key === bottomArrowIsPressed) {
            down()
            render() 
            return false
        }
        if (key === enterIsPressed) {
            openFile($(`[node-id='${state.selected.id}']`).get(0))
            hide({})
            return false
        }
        if (key === escIsPressed) {
            hide()
        } 
    })

    render()
    hide()
    
    return {
        ui: {
            show,
            hide,
            up,
            down,
            render
        },
        logic: {
            getAllFiles,
            search
        },
        state
    }
})($('#quick-open')) 