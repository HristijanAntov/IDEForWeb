
const erlangDark = {
    'body': [
        'background: #1f3d59;'
    ],
    '.file-explorer': [
        'background: #002240;'
    ],
    '.node': [
        'color: white;'
    ], 
    '.line': [
        'background: #002240;',
        'color: #d0d0d0;'
    ],
    '.line-active': [
        'background: #b36539;',
        'color: white;'
    ],
    '.visual-line.active': [
        'background-color: #091621;'
    ],
    '.editor-controller': [
        'background: #002240;'
    ],
    '.footer-menu, .options-right': [
        'background-color: #2d506f;'
    ],
    '.options-right ul li a i': [
        'color:#64ffe3;'
    ],
    '.tabs': [
        'background-color: #2d506f;',
        'box-shadow: 1px 0 11px 4px #000;'
    ],
    '.tab': [
        'background-color: #c45d21;',
        'box-sizing: border-box;',
        'color: #000;'
    ],
    '.tab:hover, .tab-active': [
        'background-color: rgb(27, 29, 26);',
        'color: white;'
    ],
    '.tab-to-save': [
        'color: blue;'
    ],
    '.tag-context': [
        'color: #ff5723;'
    ],
    '.tag-context .tag': [
        'color: #9effff;'
    ],
    '.tag-context .declaration': [
        'color: #e7a;'
    ],
    '.string': [
        'color: #3ad900;'
    ],
    '.number': [
        'color: hotpink;'
    ],
    '.commentar': [
        'color: gray;'
    ],
    '.kw': [
        'color: #ffee80;'
    ],
    '.fn-name': [
        'color: darkorchid;'
    ],
    '.operator': [
        'color: #d11;'
    ],
    '.string *': [
        'color: #3ad900;'
    ],
    '.commentar *': [
        'color: gray;'
    ],
    '.this': [
        'color: #11c6be;'
    ],
    '.new': [
        'color: deepskyblue;'
    ],
    '.obj-key': [
        'color: #ffee80;'
    ],
    '.obj-key *': [
        'color: #ffee80;'
    ],
    '.number * ': [
        'color: #ffd0d0;'
    ],
    '.brackets-active,.brackets-closed-active': [
        'color: #ff9d00;',
        'border:none;'
    ],
    '.styles-in .property': [
        'color: #6495ED;'
    ],
    '.styles-in .value': [
        'color: #50fefe;'
    ],
    '.styles-in .value .matched-value': [
        'color: #42add0;'
    ],
    '.styles-in .value .measures': [
        'color: #ff2f1f;'
    ],
    '.styles-in .value .important': [
        'color: chocolate;'
    ],
    '.selector': [
        'color: lightgreen;'
    ]
}
const blackboard = {
    'body': [
        'background: #1f3d59;'
    ],
    '.file-explorer': [
        'background: #0C1021;'
    ],
    '.node': [
        'color: white;'
    ], 
    '.line': [
        'background: #0C1021;',
        'color: #888;'
    ],
    '.line-active': [
        'background: #253B76;',
        'color: white;'
    ],
    '.visual-line.active': [
        'background-color: #091621;'
    ],
    '.editor-controller': [
        'background: #0C1021;'
    ],
    '.footer-menu, .options-right': [
        'background-color: #1c2444;'
    ],
    '.options-right ul li a i': [
        'color:#64ffe3;'
    ],
    '.tabs': [
        'background-color: #1c2444;',
        'box-shadow: 1px 0 11px 4px #000;'
    ],
    '.tab': [
        'background-color: #354171;',
        'box-sizing: border-box;',
        'color: white;'
    ],
    '.tab:hover, .tab-active': [
        'background-color: rgb(27, 29, 26);',
        'color: white;'
    ],
    '.tab-name':[
        'color: white;'
    ],
    '.tab-to-save': [
        'color: blue;'
    ],
    '.tag-context': [
        'color: #8DA6CE;'
    ],
    '.tag-context .tag': [
        'color: lightgreen;'
    ],
    '.tag-context .declaration': [
        'color: #e7a;'
    ],
    '.string': [
        'color: #61CE3C;'
    ],
    '.number': [
        'color: hotpink;'
    ],
    '.commentar': [
        'color: color: #AEAEAE;'
    ],
    '.kw': [
        'color: #FBDE2D;'
    ],
    '.fn-name': [
        'color: darkorchid;'
    ],
    '.operator': [
        'color: #d11;'
    ],
    '.string *': [
        'color: #61CE3C;'
    ],
    '.commentar *': [
        'color: color: #AEAEAE;'
    ],
    '.this': [
        'color: #11c6be;'
    ],
    '.new': [
        'color: deepskyblue;'
    ],
    '.obj-key': [
        'color: #FBDE2D;'
    ],
    '.obj-key *': [
        'color: #FBDE2D;'
    ],
    '.number * ': [
        'color: #ffd0d0;'
    ],
    '.brackets-active,.brackets-closed-active': [
        'color: #ff9d00;',
        'border:none;'
    ],
    '.styles-in .property': [
        'color: #6495ED;'
    ],
    '.styles-in .value': [
        'color: #50fefe;'
    ],
    '.styles-in .value .matched-value': [
        'color: #42add0;'
    ],
    '.styles-in .value .measures': [
        'color: #ff2f1f;'
    ],
    '.styles-in .value .important': [
        'color: chocolate;'
    ],
    '.selector': [
        'color: lightgreen;'
    ]
}
var ThemeSelect = (function() {
    let isActive = false;
    const saveTheme = (themeName) => {
        localStorage.setItem('choosen-theme', themeName);
    }
    const Themes = {
        'erlang-dark': erlangDark,
        'blackboard': blackboard
    }

    const applyTheme = (themeName) => {
        if (themeName === 'default') {
            $('style').html('');
            saveTheme(themeName)
            return true;  
        }
        let theme = Themes[themeName] 
        var cssStyle = Object.keys(theme)
            .map( cssSelector => { 
                let styles = theme[cssSelector].map(style => style.substring(0,style.length-1) + ' !important;').join('\n');
               return `${cssSelector} { ${styles}}` 
            })
            .join('\n');
        
        $('style').html(cssStyle)
        saveTheme(themeName);

    }
    const toggle = () => {
        if (!isActive)
            $('.themes-select').addClass('themes-select-active');
        else 
            $('.themes-select').removeClass('themes-select-active');
        isActive = !isActive;
    }

    $('.themes-select .theme li').click(function() {
        let themeName = $(this).attr('id');
        applyTheme(themeName);
        $(this).addClass('selected-theme').siblings().removeClass('selected-theme');
    })
    
    return {
        applyTheme,
        toggle
    }
})()
