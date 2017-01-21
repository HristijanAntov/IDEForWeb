var Drawing = (function() {
    const box_delimiters = {
        lt: '╔',
        rt: '╗',
        lb: '╚',
        rb: '╝',
        bar_horizontal: '═', 
        bar_vertical: '║'
    }
    const align = {
        left:   (field , len) => field,
        right:  (field , len) => field,
        center: (field) => {
            let aligned = ''
            let offset  = parseInt((field.length - field.trim().length) / 2)
         
            let spaces  = ' '.repeat(offset)
            aligned = spaces + field.trim() + spaces
            return aligned
        }
    }
    const shrinkField = (text, longest) => ' '.repeat((longest - text.length >= 0) ? longest - text.length : text.length ) + text
    const drawTable = (columns) => { 
       let column = columns[0]
       let longestLength  = column.reduce((maxLength , text) => (text.length > maxLength ) ? text.length : maxLength, 0)
       console.log(longestLength) 
       let shrinkedColumn = columns.map(col => col.map(field => align.center(shrinkField(field , longestLength + 2))))
       return util.reverseMatrix(shrinkedColumn)
    }
    return {
        drawTable,
        align
    }
})()