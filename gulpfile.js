//var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require("gulp-uglify");
var minifyCss = require("gulp-clean-css");
var minifyHtml = require("gulp-htmlmin");
var imagemin = require('gulp-imagemin');
var runSequence = require('run-sequence');
var clean = require('gulp-clean');

gulp.task('clean', function(){
	return gulp.src('./dist/', {read: false})
    .pipe(clean());
});

gulp.task('html', function() {
    gulp.src(['./**/*.html', '!{node_modules,demo,dist,demoHtml}/**/*.html'])
        .pipe(minifyHtml({
            collapseWhitespace: true,
            minifyJS : true,
            minifyCSS : true,
            removeComments : true,
        })) //压缩
        .pipe(gulp.dest('dist/'));
});

gulp.task('css', function() {
    gulp.src(['{src,lib}/**/*.css'])
        .pipe(minifyCss()) //压缩css
        .pipe(gulp.dest('dist/'));
});

gulp.task('js', function() {
    gulp.src(['{src,lib}/**/*.js'])
        .pipe(uglify().on('error', function(e) {
            console.log(e);
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('json', function() {
    gulp.src(['{src,lib}/**/*.json'])
        .pipe(gulp.dest('dist/'));
});

gulp.task('img', function() {
    gulp.src(['{src,lib}/**/*.{jpg,gif,png}'])
        .pipe(imagemin())
        .pipe(gulp.dest('dist/'));
});

gulp.task('font', function() {
    gulp.src(['{src,lib}/**/*.{otf,eot,svg,ttf,woff,woff2}'])
        .pipe(gulp.dest('dist/'));
});

gulp.task('ico', function() {
    gulp.src(['./**.ico'])
        .pipe(gulp.dest('dist/'));
});


gulp.task('sass', function() {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(gulp.dest('./src/css'));
});

gulp.task('sass:watch', function() {
    gulp.watch('./src/sass/**/*.scss', ['sass']);
});

gulp.task('all1', ['html']);

gulp.task('all', ['clean'],function(callback) {
    runSequence(['html', 'css', 'js', 'img', 'font', 'ico','json']);
});
