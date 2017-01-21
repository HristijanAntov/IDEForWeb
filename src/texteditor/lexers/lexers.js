var Lexers = (function () {
    const js = (code) => code
    const css = (code) => code

    const html = (code) => {

        var no = { status: false }

        const tokenizeWhiteChars = (cursor, code) => {
            var tokens = []
            var white = /\s|\t/
            var char = code[cursor]
            var test = false
            while (white.test(char) && cursor < code.length) {
                test = true
                tokens.push({
                    type: 'white',
                    value: char
                })
                cursor += 1
                char = code[cursor]

            }
            if (test) {
                return {
                    cursor,
                    tokens,
                    status: true
                }
            }
            return no;
        }

        const tokenizeString = (cursor, code) => {
            var tokens = []
            var char = code[cursor]
            var delimiters = ["'", '"']
            if (delimiters.indexOf(char) != -1) {
                var startingDelimiter = char
                var value = startingDelimiter
                cursor += 1
                char = code[cursor]
                while (char !== startingDelimiter && cursor < code.length) {
                    value += char
                    cursor += 1
                    char = code[cursor]
                }
                value = (cursor < code.length) ? value + startingDelimiter : value
                cursor = (cursor < code.length) ? cursor + 1 : cursor
                tokens.push({
                    type: 'attribute-value',
                    value: value
                })
                return {
                    cursor,
                    tokens,
                    status: true
                }
            }

            return no;
        }
        const tokenizeAttribute = (cursor, code) => {
            var tokens = []
            var char = code[cursor]
            var name = /(\S|(?!\>))/
            if (name.test(char)) {

                var value = ''
                while (!/\s|\t/.test(char) && char !== '>' && char !== '=' && cursor < code.length) {
                    value += char
                    cursor += 1
                    char = code[cursor]
                }

                tokens.push({
                    type: 'attribute-name',
                    value: value
                })
                var fromWhite = tokenizeWhiteChars(cursor, code)
                if (fromWhite.status) {
                    tokens = tokens.concat(fromWhite.tokens)
                    cursor = fromWhite.cursor
                }
                char = code[cursor]
                if (char === '=') {
                    tokens.push({
                        type: 'equals',
                        value: '='
                    })
                    cursor += 1
                    var fromWhite = tokenizeWhiteChars(cursor, code)
                    if (fromWhite.status) {
                        tokens = tokens.concat(fromWhite.tokens)
                        cursor = fromWhite.cursor
                    }
                    var fromString = tokenizeString(cursor, code)
                    if (fromString.status) {
                        tokens = tokens.concat(fromString.tokens)
                        cursor = fromString.cursor
                    }
                }


                return {
                    cursor,
                    tokens,
                    status: true
                }
            }
            return no;
        }

        const tokenizeComment = (cursor, code) => {
            var delimiters = {
                comment: {
                    start: '<!--',
                    end: '-->'
                }
            }
            var tokens = []
            var char = code[cursor]
            if (code.slice(cursor).startsWith(delimiters.comment.start)) {

                cursor += delimiters.comment.start.length
                var value = delimiters.comment.start
                while (!code.slice(cursor).startsWith(delimiters.comment.end) && cursor < code.length) {
                    char = code[cursor]
                    value += char
                    cursor += 1
                }

                tokens.push({
                    type: 'comment',
                    value: cursor < code.length ? value + delimiters.comment.end : value
                })
                if (cursor < code.length) {
                    cursor += delimiters.comment.end.length
                }
                return {
                    tokens,
                    cursor,
                    status: true
                }
            }  
            return no;
        }
        var tokenizeTag = (cursor, code) => {
            var tokens = []
            var delimiters = {
                tag: {
                    start: '<',
                    end: '>',
                    closing: '/',
                    name: /(\S|(?!\>))/
                }
            }

            if (code.slice(cursor).startsWith(delimiters.tag.start)) {
                tokens.push({
                    type: 'tag-open',
                    value: delimiters.tag.start
                })
                cursor += delimiters.tag.start.length
                var value = ''
                var char = code[cursor]
                var isClosingTag = false
                if (char === delimiters.tag.closing) {
                    tokens.push({
                        type: 'tag-closing',
                        value: delimiters.tag.closing
                    })
                    cursor += 1
                    char = code[cursor]
                    isClosingTag = true
                }
                while (!/\s|\t/.test(char) && char !== '>'  && cursor < code.length) {
                    value += char
                    cursor += 1
                    char = code[cursor]
                }
                tokens.push({
                    type: 'tag-name',
                    value: value
                })
                if (isClosingTag) {
                    fromWhite = tokenizeWhiteChars(cursor, code)
                    if (fromWhite.status) {
                        cursor = fromWhite.cursor
                        tokens = tokens.concat(fromWhite.tokens)
                    }
                    if (code[cursor] === delimiters.tag.end) {
                        tokens.push({
                            type: 'tag-close',
                            value: delimiters.tag.end
                        })
                        cursor += 1
                    }
                    return {
                        cursor,
                        tokens,
                        status: true
                    }
                }

                char = code[cursor]
                while (char !== delimiters.tag.end && cursor < code.length) {
                    // remove white 
                    // tokenize attribute 
                    var fromWhite = tokenizeWhiteChars(cursor, code)
                    if (fromWhite.status) {
                        tokens = tokens.concat(fromWhite.tokens)
                        cursor = fromWhite.cursor
                    }
                    var fromAttribute = tokenizeAttribute(cursor, code)
                    if (fromAttribute.status) {
                        tokens = tokens.concat(fromAttribute.tokens)
                        cursor = fromAttribute.cursor

                    }

                    char = code[cursor]
                    if (char === '<') {
                        tokens.push({
                            type: 'tag-open',
                            value: char
                        })
                        cursor += 1
                        break;
                    }
                }
                if (char === delimiters.tag.end) {
                    tokens.push({
                        type: 'tag-close',
                        value: delimiters.tag.end
                    })
                    cursor += 1
                }

                return {
                    cursor,
                    tokens,
                    status: true
                }
            }
        
            return no;
        }
        
        const tokenize = (code) => {
            var tokens = []
            var cursor = 0

            while (cursor < code.length) {
                var char = code[cursor]
                var value = ''
                var fromComment = tokenizeComment(cursor, code)
                if (fromComment.status) {

                    tokens = tokens.concat(fromComment.tokens)
                    cursor = fromComment.cursor
                    continue;
                } 
                var fromTag = tokenizeTag(cursor, code)
                if (fromTag.status) {

                    tokens = tokens.concat(fromTag.tokens)
                    cursor = fromTag.cursor
                    continue;
                }

                tokens.push({
                    type: 'text',
                    value: code[cursor]
                })
                cursor++
            }
          
            return tokens
        }

        return tokenize(code)
    }



    return {
        js,
        css,
        html
    }
})()