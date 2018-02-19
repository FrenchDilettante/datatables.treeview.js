const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat-util');
const connect = require('gulp-connect');
const eslint = require('gulp-eslint');
const iife = require('gulp-iife');
const KarmaServer = require('karma').Server;
const sourcemaps = require('gulp-sourcemaps');
const { template } = require('lodash');
const watch = require('gulp-watch');

const package = require('./package');

const files = [
  'src/index.js',
];

const header = template(`/*!
* <%= name %> v<%= version %>
* <%= description %>
* Copyright <%= author %> <%= license %>
* <%= homepage %>
*/
`)(package);

gulp.task('default', ['build']);
gulp.task('demo', ['watch', 'server']);

gulp.task('build', () =>
  gulp.src(files)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: [['es2015', {loose: true}]],
    }))
    .pipe(iife({
      args: ['$', 'window', 'window.document'],
      params: ['$', 'window', 'document', 'undefined'],
      useStrict: false,
    }))
    .pipe(concat.header(header))
    .pipe(sourcemaps.write('.', {
      sourceRoot: 'src/',
      includeContent: false,
    }))
    .pipe(gulp.dest('.'))
    .pipe(connect.reload())
);

gulp.task('lint', () =>
  gulp.src(['src/*.js', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('server', () =>
  connect.server({
    root: '.',
    livereload: true,
  })
);

gulp.task('watch', ['build'], () =>
  watch('src/*.js', () => gulp.run('build'))
);
