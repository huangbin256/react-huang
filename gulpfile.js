var gulp = require('gulp');
var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

var vdev = require('vdev');

// Note: babelify must be installed but do not need to be importer here. It wi referred by name in browserify.

// --------- postcss require --------- //
var postcss = require('gulp-postcss');
var cssImport = require('postcss-import'); // to allow mixin imports
var postcssMixins = require("postcss-mixins");
var postcssSimpleVars = require("postcss-simple-vars");
var postcssNested = require("postcss-nested");
var cssnext = require('postcss-cssnext'); // include autoprefixer now.

var processors = [
	cssImport,
	postcssMixins,
	postcssSimpleVars,
	postcssNested,
	cssnext({ browsers: ['last 2 versions'] })
];
// --------- /postcss require --------- //

// the default is to compile all of the client
gulp.task('default', ['build-js','build-css']);


// --------- Client Processing Tasks --------- //
// when in dev, run "gulp watch"
gulp.task('watch', ['build-js','build-css'], function () {
	gulp.watch(['./client/src/js/**/*.jsx','./client/src/js/**/*.js'], ['build-js']);
	gulp.watch(['./client/src/pcss/*.pcss'], ['build-css']);
});

// build the client files
gulp.task('build-js', function () {
	return browserify({entries: ['./client/src/js/main.jsx'], extensions: ['.jsx','.js'], debug: false})
		.transform('babelify', {presets: ['es2015', 'react']})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('client/js'));
});

gulp.task('build-css', function(){
	gulp.src(path.join('client/src/pcss/','*.pcss'))
		.pipe(sourcemaps.init())
		.pipe(postcss(processors))
		.pipe(concat('all.css'))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest('client/css/'));
});
// --------- /Client Processing Tasks --------- //

// --------- Dev Tasks --------- //
var sqlDir = "./sql/";
var dbPrefix = "react_huang";
gulp.task('recreateDb', function(){
	vdev.pg.psqlImport({user:"postgres", db:"postgres"}, vdev.pg.listSqlFiles(sqlDir,{to:0}));      
	vdev.pg.psqlImport({user: dbPrefix + "_user", db: dbPrefix + "_db"}, vdev.pg.listSqlFiles(sqlDir,{from:1}));
});
// --------- /Dev Tasks --------- //

