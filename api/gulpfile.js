const gulp = require('gulp');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const nodemon = require('gulp-nodemon');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('start', function () {
  nodemon({ script: 'dist/index.js' });
});

gulp.task('lint', function () {
  return gulp.src('src/*.ts')
    .pipe(tslint({ configuration: 'tslint.json' }))
    .pipe(tslint.report());
});

gulp.task('compile', ['lint'], function() {
  return gulp.src('src/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['compile'], function() {
  return nodemon({
    script: 'dist/index.js',
    watch: 'src',
    tasks: ['compile']
  });
});
