/* eslint-env node */

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat-util');
const connect = require('gulp-connect');
const eslint = require('gulp-eslint');
const iife = require('gulp-iife');
// const sourcemaps = require('gulp-sourcemaps');
const { template } = require('lodash');
const watch = require('gulp-watch');

const package = require('./package');

const files = [
  'src/datatables.treeview.js',
];

const header = template(`/*!
* <%= name %> v<%= version %>
* <%= description %>
* Copyright 2018, <%= author %>
* Licensed under the terms of the <%= license %> license.
* See LICENSE file in <%= homepage %> for terms.
*/
`)(package);

gulp.task('default', ['build']);
gulp.task('demo', ['watch', 'server']);

gulp.task('build', () =>
  gulp.src(files)
    // FIXME map file is out of place
    // .pipe(sourcemaps.init())
    .pipe(babel({
      presets: [['es2015', {loose: true}]],
    }))
    .pipe(iife({
      args: ['$', 'window', 'window.document'],
      params: ['$', 'window', 'document'],
      useStrict: false,
    }))
    .pipe(concat.header(header))
    // .pipe(sourcemaps.write('.', {
    //   sourceRoot: 'src/',
    //   includeContent: false,
    // }))
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
