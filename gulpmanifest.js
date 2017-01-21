module.exports = {
    destinations: {
        js: 'public/assets/js/build/',
        css: 'public/assets/css/build/',
        extras: 'public/assets/extras/'
    },

    sources: {
        bower: 'bower_components/',
        js: [ 'src/**/*.js' ],
        css: [ 'src/**/*.css' ],
        tiles: {
            js: [ 'src/tiles/**/*.js' ],
            css: [ 'src/tiles/**/*.css' ]
        },
        texteditor: {
            js: [ 'src/texteditor/**/*.js' ],
            css: [ 'src/texteditor/**/*.css' ] 
        }
    },

    overrides: {
        'jquery': {
            main: [
                './dist/jquery.js'
            ]
        },
        'bootstrap': {
            main: [
                './dist/js/bootstrap.js',
                './dist/css/bootstrap.css',
                './dist/fonts/*.*'
            ]
        }
    }

};