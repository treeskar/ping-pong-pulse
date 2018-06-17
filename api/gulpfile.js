const gulp = require('gulp');
const gutils = require('gulp-util');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');

const tsProject = ts.createProject('tsconfig.json');
const TEST_REPORT = process.env.REPORT || 'list';

gulp.task('start', () => {
  nodemon({ script: 'dist/index.js' });
});

gulp.task('lint', () => {
  return gulp.src(['src/**/*.ts'])
    .pipe(tslint({ configuration: 'tslint.json' }))
    .pipe(tslint.report());
});

gulp.task('compile', ['lint'], () => {
  return gulp.src(['src/**/*.ts', '!src/**/*spec.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));
});

gulp.task('test', ['compile'], () => {
  return gulp.src('src/**/*.spec.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'))
    .pipe(mocha({
      reporter: TEST_REPORT,
      exit: true,
    }))
    .on('error', gutils.log);
});

gulp.task('test:watch', ['test'], () => {
  gulp.watch('src/**/*.ts', ['test']);
});

gulp.task('watch', ['compile'], () => {
  return nodemon({
    script: 'dist/index.js',
    ext: 'ts',
    tasks: ['compile']
  });
});
