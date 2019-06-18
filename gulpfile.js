var gulp = require('gulp');
var plumber = require('gulp-plumber');

gulp.task('copyHTML', function () {
  return gulp.src('./source/**/*.html').pipe(gulp.dest('./public/backup'));
})

var jade = require('gulp-jade');

gulp.task('jadeCompile', function () {
  // var YOUR_LOCALS = {};

  gulp.src('./source/**/*.jade')
    .pipe(plumber())
    .pipe(jade({
      // locals: YOUR_LOCALS
      pretty: true,
    }))
    .pipe(gulp.dest('./public/'))
});

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

sass.compiler = require('node-sass');

gulp.task('scssCompile', function () {
  var plugins = [
    autoprefixer({
      overrideBrowserslist: ['last 5 version','cover 99.5% in TW']
    }),
  ];
  return gulp.src('./source/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('scssWatch', function () {
  gulp.watch('./source/scss/**/*.scss', ['scssCompile']);
});

gulp.task('multiWatch', function () {
  gulp.watch('./source/scss/**/*.scss', ['scssCompile']);
  gulp.watch('./source**/*.jade', ['jadeCompile']);
})

gulp.task('default', ['copyHTML', 'jadeCompile', 'scssCompile', 'scssWatch', 'multiWatch']);