var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var plumber = require('gulp-plumber');
var watch = require('gulp-watch'); // only for adding and deleting files
var browserSync = require('browser-sync').create();
let cleanCSS = require('gulp-clean-css');

var minimist = require('minimist');
var envOption = {
  string: 'env',
  default: {
    env: 'develop'
  }
}
var options = minimist(process.argv.slice(2), envOption);
var gulpif = require('gulp-if'); // example in scssCompile

gulp.task('copyHTML', function () {
  return gulp.src('./source/**/*.html').pipe(gulp.dest('./public/backup'));
})

// var jade = require('gulp-jade');

gulp.task('jadeCompile', function () {
  // var YOUR_LOCALS = {};

  gulp.src('./source/**/*.jade')
    .pipe(plumber())
    .pipe($.jade({
      // locals: YOUR_LOCALS
      pretty: true,
    }))
    .pipe(gulp.dest('./public/'))
    .pipe(browserSync.stream());
});

var sass = require('gulp-sass'); // only .scss
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

sass.compiler = require('node-sass');

gulp.task('scssCompile', function () {
  var plugins = [
    autoprefixer({
      overrideBrowserslist: ['last 5 version', 'cover 99.5% in TW']
    }),
  ];
  return gulp.src('./source/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(gulpif(options.env === 'production', cleanCSS({})))
    // .pipe(cleanCSS({}))
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream());
});

gulp.task('scssWatch', function () {
  gulp.watch('./source/scss/**/*.scss', ['scssCompile']);
});

gulp.task('multiWatch', function () {
  gulp.watch('./source/scss/**/*.scss', ['scssCompile']);
  gulp.watch('./source**/*.jade', ['jadeCompile']);
})

gulp.task('sassWatchCompile', function () {
  var plugins = [
    autoprefixer({
      overrideBrowserslist: ['last 5 version', 'cover 99.5% in TW']
    }),
  ];
  return gulp.src('./source/sass/**/*.scss')
    .pipe(watch('./source/sass/**/*.scss'))
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('./public/css'));
});

const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('babelCompile', () =>
  gulp.src('source/js/**/*.js')
  // .pipe(watch('./source/js/**/*.js'))
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(concat('all.js'))
  .pipe(uglify({
    compress: {
      drop_console: true,
    }
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./public/js'))
  .pipe(browserSync.stream())
);

var mainBowerFiles = require('main-bower-files');
var order = require("gulp-order");

gulp.task('bower', function () {
  return gulp.src(mainBowerFiles({
      "overrides": {
        "bootstrap": {
          "main": "dist/js/bootstrap.js"
        }
      }
    }))
    .pipe(gulp.dest('./.tmp/vendors'))
});

gulp.task('vendorsJS', ['bower'], function () {
  return gulp.src('./.tmp/vendors/**/*.js')
    .pipe(order([
      'jquery.js',
      'bootstrap.js'
    ]))
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest('./public/js'))
})

// put before watch in default
// Static server
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./public"
    },
    reloadDebounce: 2000,
  });
});

gulp.task('default', ['copyHTML', 'jadeCompile', 'scssCompile', 'scssWatch', 'multiWatch', 'babelWatchCompile', 'browser-sync']);