// -------------------
//      Requires
// -------------------


var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if'); 
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');


// --------------------------
//      Development Tasks
// --------------------------


// Start BrowserSync Server
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    });
});


// Sass Task
gulp.task('sass', function() {
   return gulp.src('app/scss/**/*.scss') // Get all .scss files in app/scss
   .pipe(sass()) // Passes it through a gulp-sass
   .pipe(gulp.dest('app/css')) // Outputs it in CSS folder
   .pipe(browserSync.reload({ 
       stream: true // Reloading with BrowserSync
   }));
});


// Watchers
gulp.task('watch', ['browserSync', 'sass'], function() {     
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});


// --------------------------
//     Optimization Tasks
// --------------------------


// Otimizing CSS and JavaScript
gulp.task('useref', function() {
   return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify())) // Minify only if JS file
    .pipe(gulpIf('*.css', cssnano())) // Minify only if CSS file
    .pipe(gulp.dest('dist'));
});


// Optimizing Images
gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({plugins: [{removeViewBox: true}]})
    ], {
    verbose: true
    })))                     
    .pipe(gulp.dest('dist/images'));
});


// Copying Fonts
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});


// Cleaning
gulp.task('clean', function() {
    return del.sync('dist');
});


// Cache Clear
gulp.task('cache:clear', function() {
   return cache.clearAll(); 
});


// --------------------------
//       Build Sequences
// --------------------------


// Watch, Compile and Reload Browser
gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  );
});


// Delete and Build 'Dist' Folder
gulp.task('build', function(callback) {
    runSequence(
        'clean',
        'sass',
        ['useref', 'images', 'fonts'],
        callback
    );
});