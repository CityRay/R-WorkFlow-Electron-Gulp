const gulp = require('gulp');
const path = require('path');
const argv = require('yargs').argv;
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed');
const gulpNotify = require("gulp-notify");
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();

const paths = {
  html: './src/**/*.html',
  images: './src/**/*.+(png|jpg|gif|svg)',
  css: './src/Content/**/*.+(css|map)',
  scss: './src/scss/*.scss',
  js: './src/Scripts/**/*.+(js|map)',
  fonts: './src/fonts/**/*.+(otf|eot|ttf|woff|woff2)',
  dist: './dist'
};

// Browser Sync
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: paths.dist
        }
    });

    gulp.watch(paths.scss, ['scss:dev']);
    gulp.watch(paths.html, ['copy:html']);
    gulp.watch(paths.js, ['copy:js']);
    // gulp.watch(paths.html).on('change', browserSync.reload);
});

/**
 * SCSS 編輯
 */
gulp.task('scss:dev', function() {
  return gulp.src(paths.scss, {
      base: 'src/scss'
    })
    .pipe(sourcemaps.init())
    // nested, expanded, compact, compressed
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/Content'))
    .pipe(browserSync.stream());
});

/**
 * 圖片壓縮 JPG PNG GIF
 */
gulp.task('images', function () {
  return gulp.src(paths.images, {
      base: 'src'
    })
    .pipe(changed(paths.dist))
    .pipe(imagemin({
      optimizationLevel: 5, // default：3  取值範圍：0-7（優化等級）
      progressive: true, // default：false 無損壓縮 JPG
      interlaced: true, // default：false 隔行掃描 GIF Render
      svgoPlugins: [{removeViewBox: false}],
      use: [
        pngquant({
          speed: 4
        })
      ]
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('develop_notify', ['scss:dev','images'],function () {
  return gulp.src('./readme.md')
    .pipe(gulpNotify("Start Developing..."));
});

// Copy Source (like: html ...)
gulp.task('copy:html', function() {
  // HTML
  return gulp.src(paths.html, {
    base: 'src'
  })
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
});

gulp.task('copy:js', function() {
  // Javascript
  return gulp.src(paths.js, {
    base: 'src'
  })
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
});

gulp.task('copy:css', function() {
  // CSS
  return gulp.src(paths.css,{
    base: 'src'
  })
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
});

gulp.task('copy:fonts', function() {
  // Fonts
  return gulp.src(paths.fonts, {
    base: 'src'
  })
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
});

// Create Project
gulp.task('create:project', function() {
  return gulp.src('./source/**/*.*')
    .pipe(gulp.dest(argv.cpath));
});


// Main Task
// Developing
gulp.task('developing', function(callback) {
  runSequence(['scss:dev','images', 'copy:html', 'copy:js', 'copy:css', 'copy:fonts'],
              'browser-sync',
              'develop_notify',
              callback);
});
