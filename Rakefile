require 'nokogiri'
require 'open-uri'

namespace :color do
  "Dump colors from `Material Design Color` in  assets/data/color-dump.json"
  task :collect do
    page = Nokogiri::HTML(open("http://www.google.com/design/spec/style/color.html"))
    page.css('.color-group')
  end
end

// Run this script in the browser console
// of the material design color page,
// it will retrieve the content to paste in colors.json

var groups = document.querySelectorAll('.color-group');
var colors = {};
for (var i = 0; i < groups.length; i++) {
  var group = groups[i];
  if (!group.querySelector('.main-color')) {
    continue;
  }
  var colorName = group.querySelector('.name').innerHTML.replace(/\s/, '').toLowerCase();
  var colorTags = group.querySelectorAll('.color');
  var shades = {};
  for (var j = 0; j < colorTags.length; j++) {
    var color = colorTags[j];
    var hex = color.querySelector('.hex').innerHTML;
    var textColor = (color.querySelector('.dark') ? 'black' : 'white');
    var shade = color.querySelector('.shade').innerHTML;
    shades[shade] = {
      color: hex,
      text: textColor
    };
  }
  var colorDef = {
    shades: shades,
    primary: '500',
    primaryLight: '700',
    primaryLighter: '900',
    primaryDark: '300',
    primaryDarker: '50',
    accent: 'A200',
    accentDark: 'A400',
    accentDarker: 'A700'
  };
  colors[colorName] = colorDef;
}
JSON.stringify(colors, null, 2);

desc "Regenerate documentation"
task :doc do
  `sass "doc/assets/stylesheets/doc.scss" "doc/assets/css/doc.css"`
end
