var gulp = require("gulp"),
    gutil = require('gulp-util'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    watchify = require("watchify"),
    browserify = require("browserify"),
    reactify = require("reactify"),
    source = require("vinyl-source-stream"),
    less = require("gulp-less"),
    plumber = require('gulp-plumber'),
    rimraf = require('gulp-rimraf'),
    runSequence = require('run-sequence'),
    rsync = require('rsyncwrapper').rsync;

var BASES = {
  build: './build',
  htmlAll: './src/**/*.html',
  lessEntry: './src/style.less',
  lessAll: './src/**/*.less',
  jsEntry: './src/app.jsx',
  assets: ['./src/images/**.*']
};

var SERVER_PORT = 3000;

var onError = function (error) {
  gutil.beep();
  gutil.log(gutil.colors.red("Error: "), error);
};

gulp.task('clean', function () {
  return gulp.src(BASES.build, {read: false}).pipe(rimraf());
});

gulp.task('serve', function() {
  browserSync({
    notify: false,
    server: {
      baseDir: BASES.build
    },
    ports: {
      min: SERVER_PORT
    }
  });
  console.log("Point your browser to #{SERVER_PORT}");
});

gulp.task('html', function() {
  gulp.src(BASES.htmlAll)
      .pipe(gulp.dest(BASES.build))
      .pipe(reload({stream: true, once: true}));
});

gulp.task('assets', function() {
  gulp.src(BASES.assets)
      .pipe(gulp.dest(BASES.build))
      .pipe(reload({stream: true, once: true}));
});

gulp.task("less", function(){
  return gulp.src(BASES.lessEntry)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(less())
    .pipe(gulp.dest(BASES.build))
    .pipe(reload({stream: true, once: true}));
});

function buildJs(watch) {
  return function() {
    var browserifyBundler = browserify(watchify.args,{debug: watch});
    browserifyBundler.add(BASES.jsEntry);
    var bundler = watch ? watchify(browserifyBundler) : browserifyBundler;

    var bundle = function(ids){

       var b = bundler
        .transform({es6:true, everything:true},reactify);
        if (!watch) {
          var envify = require('envify'),
              uglifyify = require("uglifyify");

          b = b
            .transform({global: true}, envify)
            .transform({global:true},uglifyify);
        }
      return b
        .bundle()
        .on("error", onError)
        .on("end", function() {
          gutil.log("Created:", gutil.colors.cyan("bundle.js"), (ids||[]).join(", "));
        })
        .pipe(source("bundle.js"))
        .pipe(gulp.dest(BASES.build))
        .pipe(reload({stream: true, once: true}));
    };

    if (watch) {
      bundler.on("update", bundle)
        .on("log", function(message) {
          gutil.log(gutil.colors.cyan("Watchify: "),message);
        });
    }
    return bundle();
  };
}

gulp.task('watchify', buildJs(true));
gulp.task('build-js', buildJs(false));

gulp.task("watch", function(){
  gulp.watch(BASES.htmlAll, ["html"]);
  gulp.watch(BASES.lessAll, ["less"]);
  gulp.watch(BASES.assets, ["assets"]);
});

gulp.task("rev", function() {
  var imagemin = require('gulp-imagemin'),
      revall = require('gulp-rev-all'),
      chmod = require('gulp-chmod');

  return gulp.src([BASES.build+"/**/*.*","!"+BASES.build+"/cdn/**"])
    .pipe(revall({ignore: ['.html']}))
    .pipe(chmod(644))
    .pipe(imagemin({progressive:true}))
    .pipe(gulp.dest(BASES.build+"/cdn"));
});

gulp.task("upload", function(callback) {
  rsync({
    // ssh: true,
    src: [BASES.build+"/cdn/*"],
    dest: 'www-data@danielberndt.net:/var/www/playground/card-flip',
    recursive: true,
    syncDest: true,
    args: ['--verbose']
  }, function(error, stdout, stderr, cmd) {
      gutil.log(stdout);
      callback();
  });
});

gulp.task("build", ["html", "assets", "less"]);

gulp.task("default",["serve","build","watch","watchify"]);

gulp.task("deploy", function(callback) {
  runSequence("clean", "build", "build-js", "rev", "upload", callback);
});