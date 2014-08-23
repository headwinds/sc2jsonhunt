var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean');

// Browserify task
gulp.task('browserify', function() {
  // Single point of entry (make sure not to src ALL your files, browserify will figure it out for you)
  gulp.src(['static/js/app.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: true
  }))
  // Bundle to a single file
  .pipe(concat('static/dist/bundle.js'))
  // Output it to our dist folder
  .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  // Watch our scripts
  gulp.watch(['static/js/*.js', 'static/js/**/*.js'],[
    'browserify'
  ]);
});