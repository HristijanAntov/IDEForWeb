/* =================================================================================================
 * CONFIGURATION
 * ===============================================================================================*/
var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var concatCSS = require('gulp-concat-css');
var uglify = require('gulp-uglify');
var addsrc = require('gulp-add-src');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var filter = require('gulp-filter');
var rebaseCSSURLs = require('gulp-rebase-css-urls')
var mainBowerFiles = require('main-bower-files');
var eventStream = require('event-stream');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var removeDirectories = require('remove-empty-directories');
var config = require('./gulpmanifest.js');
var sources = config.sources;
var root = config.root;
var allDestinations = [];



var bundleNames = {
    js: 'ide.min.js',
    css: 'ide.min.css',
    tiles: {
        js: 'tiles.min.js',
        css: 'tiles.min.css'
    },
    texteditor: {
        js: 'texteditor.min.js',
        css: 'texteditor.min.css'
    }
}

for (var x in config.destinations)
    allDestinations.push(config.destinations[x]);


gulp.task('tiles.css', [], function () {
    return gulp.src(sources.tiles.css)
        .pipe(sourcemaps.init())
        .pipe(concat(bundleNames.tiles.css))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destinations.css));
});

gulp.task('tiles.js', [], function () {
    var ug = uglify();
    ug.on('error', function (e) {
        console.log('ERROR: ' + e.message);
        console.log('FILE:  ' + e.fileName);
        console.log('LINE:  ' + e.lineNumber);
        ug.end();
    });

    return gulp.src(sources.tiles.js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015', 'es2017']
        }))
        .pipe(concat(bundleNames.tiles.js))
        .pipe(ug)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destinations.js));
})


gulp.task('texteditor.css', [], function () {
    return gulp.src(sources.texteditor.css)
        .pipe(sourcemaps.init())
        .pipe(concat(bundleNames.texteditor.css))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destinations.css));
});

gulp.task('texteditor.js', [], function () {
    var ug = uglify();
    ug.on('error', function (e) {
        console.log('ERROR: ' + e.message);
        console.log('FILE:  ' + e.fileName);
        console.log('LINE:  ' + e.lineNumber);
        ug.end();
    });

    return gulp.src(sources.texteditor.js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015', 'es2017']
        }))
        .pipe(concat(bundleNames.texteditor.js))
        .pipe(ug)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destinations.js));
})


gulp.task('frontend.css', [], function () {
    return gulp.src(sources.css)
        .pipe(sourcemaps.init())
        .pipe(concat(bundleNames.css))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destinations.css));
});

gulp.task('frontend.js', [], function () {
    var ug = uglify();
    ug.on('error', function (e) {
        console.log('ERROR: ' + e.message);
        console.log('FILE:  ' + e.fileName);
        console.log('LINE:  ' + e.lineNumber);
        ug.end();
    });
    return gulp.src(sources.js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015', 'es2017']
        }))
        .pipe(concat(bundleNames.js))
        .pipe(ug)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destinations.js));
});

gulp.task('frontend.clean', [], function () {
    return del([
        config.destinations.js + bundleNames.js,
        config.destinations.css + bundleNames.css
    ]);
});

gulp.task('frontend', ['frontend.css', 'frontend.js'], function () {
});

/* =================================================================================================
 * LIBRARIES TASKS 
 * gulp libraries
 * gulp libraries.js
 * gulp libraries.css
 * gulp libraries.extras
 * ===============================================================================================*/

gulp.task('libraries.copy', ['libraries.clean'], function () {
    return gulp.src(mainBowerFiles({ overrides: config.overrides }), { base: sources.bower })
        .pipe(addsrc(sources.bower + '**/bower.json'))
        .pipe(gulp.dest(config.destinations.extras));
});

gulp.task('libraries.js', ['libraries.copy'], function () {
    //console.log(mainBowerFiles('**/*.js',{overrides: config.overrides, paths: {bowerDirectory: config.destinations.extras}}), {base: config.destinations.extras});
    return gulp.src(mainBowerFiles('**/*.js', { overrides: config.overrides, paths: { bowerDirectory: config.destinations.extras } }), { base: config.destinations.extras })
        .pipe(sourcemaps.init())
        .pipe(concat('libraries.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destinations.js));
});

gulp.task('libraries.css', ['libraries.copy'], function () {
    //console.log(mainBowerFiles('**/*.css',{overrides: config.overrides, paths: {bowerDirectory: config.destinations.extras}}), {base: config.destinations.extras});
    return gulp.src(mainBowerFiles('**/*.css', { overrides: config.overrides, paths: { bowerDirectory: config.destinations.extras } }), { base: config.destinations.extras })
        .pipe(sourcemaps.init())
        .pipe(concatCSS('libraries.min.css', { newLine: '\r\n\r\n' }))
        .pipe(rebaseCSSURLs(config.destinations.css))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.destinations.css))
});

gulp.task('libraries.removeCompresed', ['libraries.css', 'libraries.js'], function () {
    return del([config.destinations.extras + '**/bower.json', config.destinations.extras + '**/*.js', config.destinations.extras + '**/*.css']);
});

gulp.task('libraries.cleanEmptyFolders', ['libraries.removeCompresed'], function () {
    removeDirectories(config.destinations.extras);
});

gulp.task('libraries.clean', [], function () {
    return del([
        config.destinations.extras + '**',
        config.destinations.css + 'libraries.min.css',
        config.destinations.js + 'libraries.min.js'
    ]);
});

gulp.task('libraries', ['libraries.cleanEmptyFolders']);

/* =================================================================================================
 * CLEAN, WATCH, BUILD & DEFAULT
 * ===============================================================================================*/

gulp.task('clean', function () {
    return del(allDestinations);
});

gulp.task('watch', function () {
    var manifest = gulp.watch(['gulpmanifest.json'], ['frontend']);
    manifest.on('change', function (event) {
        console.log('Compiling JavaScript and CSS');
    });

    var scripts = gulp.watch(sources.texteditor.js, ['texteditor.js']);
    scripts.on('change', function (event) {
        console.log('Compiling JavaScript');
    });

    var styles = gulp.watch(sources.texteditor.css, ['texteditor.css']);
    styles.on('change', function (event) {
        console.log('Compiling Style');
    });
});

gulp.task('build', function () {
    gulp.start(['frontend', 'libraries', 'tiles.js','tiles.css', 'texteditor.js', 'texteditor.css']);
});

gulp.task('default', ['build']);
