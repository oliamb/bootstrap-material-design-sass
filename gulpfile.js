var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var fs = require('fs');
var mainBowerFiles = require('main-bower-files');

gulp.task('sass', function () {
  gulp.src('doc/assets/stylesheets/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({
    includePaths: ['assets/stylesheets', '.'],
    precision: 8
  }))
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: true
  }))
  .pipe(sourcemaps.write('maps'))
  .pipe(gulp.dest('./doc/assets/css'));
});

gulp.task('copyFonts', function() {
  return gulp.src(mainBowerFiles({filter: /.*\.(woff2?|eot|svg|ttf)/}))
  .pipe(gulp.dest('doc/assets/fonts'));
});

gulp.task('default', function() {
  gulp.watch('assets/stylesheets/**/*.scss', ['sass']);
});



gulp.task('generateColorData', function(cb) {
  // Return an array containing two variable declaration
  // for a given color.
  var shadeVariable = function(prefix, shade, hex, dark) {
    return [
      '$'+prefix+'-color-'+shade+': '+hex+';',
      '$'+prefix+'-text-color-'+shade+': '+(dark ? '#FFFFFF':'#000000')+';'
    ];
  };

  // Return an array variable definitions containing all shades from
  // a given color.
  var colorBlock = function(prefix, color) {
    return _.flatten(_.map(color.shades, function(shade) {
      return shadeVariable(prefix, shade.name, shade.hex, shade.dark);
    }));
  };
  var colorConditionalBlock = function(prefix, color) {
    return _.flatten([
      '@if $'+prefix+'-color-name == "'+color.name+'" {',
      _.map(colorBlock(prefix, color), function(line) {
        return '  '+line;
      }),
      '}'
    ]);
  };
  fs.readFile('assets/data/color_dump.json', function(err, data) {
    if (err) {
      return cb(err);
    }
    var colors = JSON.parse(data);
    var scssContent = _.flatten(_.map(colors, function(color) {
      return ['','', '// Color: ' + color.name, '']
        .concat(colorBlock(color.name, color))
        .concat()
        .concat(colorConditionalBlock('primary', color))
        .concat(colorConditionalBlock('accent', color));
      }))
    .join('\n');
    fs.writeFile('assets/stylesheets/material_design/_color_data.scss', scssContent, function(err) {
      return cb(err);
    });
  });
});

gulp.task('collectColorData', function(cb) {
  request('http://www.google.com/design/spec/style/color.html', function (error, response, body) {
    if (error) {
      return cb(error);
    }
    if (response.statusCode !== 200) {
      return cb('Error Code ' + response.statusCode);
    }
    var $ = cheerio.load(response.body);
    var result = _.reduce($('.color-group'), function(colors, group) {
      var name = $('.name', group).html();
      if (!name) {
        // Skip the special black/white definition.
        return colors;
      }
      colors.push({
        name: name.replace(/\s/, '').toLowerCase(),
        shades: _.reduce($('.color', group), function(shades, color) {
          if ($(color).hasClass('main-color')) {
            // Skip the main shade as it is repeated after
            return shades;
          }
          shades.push({
            name: $('.shade', color).html(),
            hex: $('.hex', color).html(),
            // So that you should write with a bright color
            dark: !$(color).hasClass('dark')
          });
          return shades;
        }, [])
      });
      return colors;
    }, []);
    fs.writeFile("assets/data/color_dump.json", JSON.stringify(result, null, 2), function(err) {
      cb(err);
    });
  });
});
