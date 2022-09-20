var gulp = require('gulp');       // 导入gulp
var uglify = require('gulp-uglify'); // 导入gulp-uglify


// 创建压缩任务
gulp.task('js', function() {
	gulp.src('src/tpl/*')
		.pipe(gulp.dest('dist/tpl'))
	// 1. 找到文件
	gulp.src('src/*.js')
		// 2. uglify压缩
		.pipe(uglify())
		// 3. 另存到dist压缩后的文件
		.pipe(gulp.dest('dist'))
})
