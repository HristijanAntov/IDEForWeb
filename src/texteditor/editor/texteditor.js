

function count_lines(model) {
    var lines = model.value.split(/\n/).length
    return lines
}

function getCurrentLine(model) {
    var before = model.value.substring(0, model.selectionEnd)
    return before.split(/\n/).length
}

function getCurrentColumn(model) {
    var before = model.value.substring(0, model.selectionEnd);
    var chars_in_lines = before.split(/\n/).map(line => line.length);
    var offset_chars = chars_in_lines.length - 1;
    chars_in_lines = chars_in_lines.slice(0, chars_in_lines.length - 1);
    var sum = chars_in_lines.reduce((prev, curr) => prev + curr, 0);

    return before.length - offset_chars - sum + 1;
}

function jumpToLine(editor_id, line) {
    var model = $("#" + editor_id).find(".model").get(0);
    var text = model.value.split(/\n/).slice(0, line).map(_line => _line.length);
    var offset_chars = text.length - 1;
    text.pop();
    var sum = text.reduce((prev, curr) => prev + curr, 0);
    model.selectionStart = sum + offset_chars;
    model.selectionEnd = sum + offset_chars;
}

function getIndentationOfLastLine(model) {
    var text = model.value.substring(0, model.selectionEnd)
    var lines = text.split(/\n/)
    var last_line = lines[lines.length - 1]
    var last_line_indentation = last_line.match(/\s*/)

    if (last_line_indentation.length > 0) {
        return last_line_indentation[last_line_indentation.length - 1]
    }

    return ""
}

function draw_lines(linesWrapper, linesCount, currentLine, editor_id) {
    const range = (from, to) => Array.from(new Array(to - from), (_, i) => i + from)
    const renderLine = function (lineNumber) {
        let classes = 'line ' + (lineNumber == currentLine ? 'line-active' : '')
        let events = ` jumpToLine('${editor_id}','${lineNumber}')`
        return `<div class="${classes}" onClick="${events}">${lineNumber}</div>`
    }

    const lines = range(1, linesCount + 1).map(lineNumber => renderLine(lineNumber)).join('')
    linesWrapper.innerHTML = lines
}

function shrinkEditor(editor, model, view) {
    var line_height = $(model).css("line-height").split("px")[0]
    var height = line_height * count_lines(model) + 2;
    $(editor).css("height", height + "px")
}

function highlightedArea(editorController, view) {

    let lineTo = editorController.scrollTop() / parseInt(view.css('line-height').slice(0, -2)) + 50


    return lineTo
}

function parse(model, view, container_cursor_mapper, find_replace) {
    var text = model.value
    var before = escape_html(text.substring(0, model.selectionEnd))
    var after = escape_html(text.substring(model.selectionEnd))

    if (find_replace.search_content != "") {
        var pattern = find_replace.search_content;
        var rpl = "<span class='text-selected'>$1</span>";

        if (!find_replace.regex) {
            pattern = find_replace.search_content
                .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
        try {
            pattern = new RegExp("(" + pattern + ")", "g");
        }
        catch (err) {
            // Намерно го правам вака да изгледа со цел да не може да се пронајде долу доколку не е валиден регуларен израз
            pattern = "u1io2ewkmdfjguitoi23qklwmasdnjfruiokqwl,smdnjkfeikewl";

        }
        before = before.replace(pattern, rpl);
        after = after.replace(pattern, rpl);
    }
    var clone_content = before + "<span class='cursor-mapper'></span>" + after
    container_cursor_mapper.innerHTML = clone_content;

    var tokens = Lexers.html(text)
    var highlighted = tokens.map(token => {
        const span = (color, value) => `<span style="color:${color}">${escape_html(value)}</span>`
        switch (token.type) {
            case 'tag-open': return span('#999999', token.value)
            case 'tag-close': return span('#999999', token.value)
            case 'tag-closing': return span('#999999', token.value)
            case 'tag-name': return span('#ee3234', token.value)
            case 'attribute-name': return span('deepskyblue', token.value)
            case 'equals': return span('#1aff1a', token.value)
            case 'attribute-value': return span('orange', token.value)
            case 'comment': return span('gray', token.value)
            default: return span('white', token.value)
        }
    }).join('')

    view.innerHTML = highlighted
}

function parseCSS(model, view, container_cursor_mapper, find_replace) {
    var text = model.value;
    var before = escape_html(text.substring(0, model.selectionEnd))
    var after = escape_html(text.substring(model.selectionEnd))

    if (find_replace.search_content != "") {
        var pattern = find_replace.search_content;
        var rpl = "<span class='text-selected'>$1</span>";
        if (!find_replace.regex) {
            pattern = find_replace.search_content
                .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
        try {
            pattern = new RegExp("(" + pattern + ")", "g");
        }
        catch (err) {
            pattern = "u1io2ewkmdfjguitoi23qklwmasdnjfruiokqwl,smdnjkfeikewl";

        }
        before = before.replace(pattern, rpl);
        after = after.replace(pattern, rpl);
    }

    var clone_content = before + "<span class='cursor-mapper'></span>" + after

    container_cursor_mapper.innerHTML = clone_content
    text = escape_html(text);
    text = text.replace(string_regex1, string_hightlight);
    text = text.replace(string_regex, string_hightlight); //Hightlight za string 
    text = text.replace(tag_regex, tag_highlight); //Hightlight za ime na tag 

    // Vaka ja reducirame Hash Mapata i gi dobivame site vrednosti vo samo edna lista
    // unique se koristi so cel da ne se povtoruvaat dolu mi e implementirana taa funkcija
    var allPossibleValues =
        unique(
            Object.keys(cssPropertyValueMap)
                .reduce((prev, curr) => prev
                    .concat(cssPropertyValueMap[curr]), [])
                .filter(value => !/\[/g.test(value)));




    var measures_regex = /\b(em|px|\%|rem|dpi|cm|mm)/g;
    var measures_highlilght = "<span class='measures'>$1</span>";

    var color_regex = /(\#[0-9a-fA-F]{6}|\#[0-9a-fA-F]{3})/g;
    var color_highlight = "<span class='color' style='border-radius:5px;padding:1px;background-color:$1'>$1</span>";

    var important_regex = /(\s+|\:)(\!important)/g;
    var important_highlight = "$1<span class='important'>$2</span>";
    var number_regexCSS = /(\s+|\:)([0-9]+\.{0,1}[0-9]*)/g;
    var number_highlightCSS = "$1<span class='number'>$2</span>";

    text = text.replace(number_regexCSS, number_highlightCSS);

    text = text.replace(measures_regex, measures_highlilght);
    text = text.replace(/(\.[\w+\-*\w*]+|\#[\w+\-*\w*]+)/g, "<span class='selector'>$1</span>");

    text = text.replace(brackets_open_regex, "{<span class='styles-in'>");
    text = text.replace(brackets_close_regex, "</span>}");
    text = text.replace(/([\w+\-*\w*]+)(\s*)(\:)/g, "<span class='property'>$1</span>$2$3");


    text = text.replace(important_regex, important_highlight);
    for (var i = 0; i < allPossibleValues.length; i++) {
        var matched_value_regex = new RegExp("(\\s+|\:)" + allPossibleValues[i], "g");

        var matched_value_highlight =
            "$1<span class='matched-value'>" + allPossibleValues[i] + "</span>";
        text = text.replace(matched_value_regex, matched_value_highlight);
    }

    text = text.replace(/(\:\s*)(.*?)/g, "$1<span class='value'>$2");
    text = text.replace(/\;/g, ";</span>")
    var allColorNames = cssPropertyValueMap["color"];
    for (var i = 0; i < allColorNames.length; i++) {
        var c_regex = new RegExp("(\>)" + allColorNames[i] + "(\<\/)", "g");
        var c_highlight =
            "$1<span class='color' style='background-color:" +
            allColorNames[i]
            + " !important;'>" + allColorNames[i] + "</span>$2";
        text = text.replace(c_regex, c_highlight);
    }

    text = text.replace(brackets_open_regex, bracket_open_highlight);
    text = text.replace(brackets_close_regex, bracket_close_highlight);
    text = text.replace(color_regex, color_highlight);







    view.innerHTML = text;
}



// @Author: Hristijan Antov
// Function to match all keywords and other stuff( bilo sto vsunsot) 
function parseJS(model, view, container_cursor_mapper, find_replace) {
    var text = model.value;
    var before = escape_html(text.substring(0, model.selectionEnd))
    var after = escape_html(text.substring(model.selectionEnd))



    if (find_replace.search_content != "") {
        var pattern = find_replace.search_content;
        var rpl = "<span class='text-selected'>$1</span>";

        if (!find_replace.regex) {

            // Vaka go escapirame regularniot izraz da se odnesuva kako obicen string 
            // a go instancirame so RegExp konstruktorot so cel da go koristime global(g) flagot
            // vo replace funkcijata

            pattern =
                find_replace
                    .search_content
                    .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
        try {
            pattern = new RegExp("(" + pattern + ")", "g");
        }
        catch (err) {
            pattern = "u1io2ewkmdfjguitoi23qklwmasdnjfruiokqwl,smdnjkfeikewl";
            console.log(err);
        }
        before = before.replace(pattern, rpl);
        after = after.replace(pattern, rpl);
    }



    var clone_content = before + "<span class='cursor-mapper'></span>" + after




    container_cursor_mapper.innerHTML = clone_content
    text = escape_html(text);

    var text_arr = text.split(/\n/g);

    for (var i in text_arr) {
        var text = text_arr[i];

        text = text.replace(string_regex1, string_hightlight1);
        text = text.replace(string_regex, string_hightlight);
        text = text.replace(function_regex, function_highlight);
        text = text.replace(brackets_open_regex, bracket_open_highlight);
        text = text.replace(brackets_close_regex, bracket_close_highlight);
        text = text.replace(this_regex, this_highlight);
        text = text.replace(new_regex, new_highlight);

        for (var keyword of keywords) {
            var kw_regex = new RegExp("\\b(" + keyword + ")\\b", "g");
            text = text.replace(kw_regex, "<span class='kw'>$1</span>");
        }

        text = text.replace(number_regex, number_highlight);
        text = text.replace(comment_regex, comment_highlight);




        var this_line = parseInt(i) + 1;

        var classes = 'visual-line line-' + this_line;
        classes += this_line == getCurrentLine(model) ? " active" : "";



        text = "<div class='" + classes + "'>" + text + "</div>";
        text_arr[i] = text;
    }

    view.innerHTML = text_arr.join("");
}

function escape_html(tag) {
    tag = tag.replace(/</g, "&lt");
    tag = tag.replace(/>/g, "&gt");
    return tag;
}

function position_cursor(cursor, cursor_mapper) {

    var left = $(cursor_mapper).offset().left;
    var top = $(cursor_mapper).offset().top - 3;
    $(cursor).css({ left: left, top: top });

}

function putWord(model, word) {

    var text = model.value;
    var before = text.substring(0, model.selectionEnd)
    var after = text.substring(model.selectionEnd)
    var clone_content = before + word + after


    model.value = clone_content
    model.selectionEnd = before.length + word.length

}
function putBrackets(model, bracket) {

    var brackets_closed = {
        "{": "}",
        "(": ")",
        '"': '"',
        "'": "'",
        "[": "]"
    }

    var text = model.value;
    var before = text.substring(0, model.selectionEnd)
    var after = text.substring(model.selectionEnd)
    var clone_content = before + bracket + brackets_closed[bracket] + after


    model.value = clone_content
    model.selectionEnd = before.length + 1;
}

function toggleTreeView() {
    var left = $(".file-explorer").css("left") == "0px" ? "-295px" : "0px";
    var forEditors = left == "-295px" ? { "margin": "0px", "width": "100%" } : { "margin": "295px", "width": "calc(100% - 295px)" }

    $(".file-explorer").animate({
        "left": left
    }, 100);
    $(".editors").animate({
        "margin-left": forEditors.margin
    }, 100);
    $(".editors").css("width", forEditors.width)
}


function detectBrackets(model, view) {

    if (model.value.substring(model.selectionEnd - 1, model.selectionEnd) != "}") {
        return -1;
    }

    var text = model.value.substring(0, model.selectionEnd - 1)
    var num_closed = countCharInText(text, "}");


    var BracketsStack = ["}"];
    for (var i = text.length - 1; i >= 0; i--) {

        if (text[i] == "{") {
            BracketsStack.pop();
        }
        if (text[i] == "}") {
            BracketsStack.push("}");
        }
        if (BracketsStack.length == 0) {
            var num_opened = countCharInText(text.substring(0, i), "{");
            $(view)
                .find(".brackets-closed")
                .eq(num_closed)
                .addClass("brackets-closed-active");
            $(view)
                .find(".brackets")
                .eq(num_opened)
                .addClass("brackets-active");
            return 1;
        }
    }
}

function detectBracketsDown(model, view) {
    if (model.value.substring(model.selectionEnd - 1, model.selectionEnd) != "{") {
        return -1;
    }
    var BracketsStack = ["{"];
    var text = model.value.substring(model.selectionEnd);
    var text_before = model.value.substring(0, model.selectionEnd - 1);
    var num_opened = countCharInText(text_before, "{");

    for (var i = 0; i < text.length; i++) {
        if (text[i] == "}")
            BracketsStack.pop();

        if (text[i] == "{")
            BracketsStack.push("{");

        if (BracketsStack.length == 0) {
            var num_closed = countCharInText(text_before, "}");
            num_closed += countCharInText(text.substring(0, i), "}");
            $(view)
                .find(".brackets-closed")
                .eq(num_closed)
                .addClass("brackets-closed-active");
            $(view)
                .find(".brackets")
                .eq(num_opened)
                .addClass("brackets-active");
            return 1;
        }
    }
}
function countCharInText(text, char) {
    return text.split(char).length - 1;
}
function setSelectionOnCurrentWord(model) {
    var text = model.value;
    var before = text.substring(model.selectionEnd - 20, model.selectionEnd);
    var after = text.substring(model.selectionEnd, model.selectionEnd + 20);
    var last_word = before.split(/\W/g);
    var suffix = after.split(/\W/g);
    suffix = suffix[0];
    last_word = last_word[last_word.length - 1];
    model.setSelectionRange(model.selectionEnd - (last_word.length), model.selectionEnd + suffix.length);
}