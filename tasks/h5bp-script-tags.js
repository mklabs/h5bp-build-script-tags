
var path = require('path'),
fs = require('fs');

// https://github.com/h5bp/html5-boilerplate/issues/831
//

var regbuild = /^\s*<!--\s*\[\[\s*build\s(\w+)\s([\w\d\.\-_]+)\s*\]\]\s*-->/,
  regend = /\s*<!--\s*\[\[\s*endbuild\s*\]\]\s*-->/;

// Load processors
var processors = {};
fs.readdirSync(path.join(__dirname, 'processors')).forEach(function(file) {
  var filepath = path.resolve(__dirname, 'processors', file),
    filename = path.basename(file).replace(path.extname(file), '');

  if(!fs.statSync(filepath).isFile()) return;

  processors[filename] = require(filepath);
});


// > make the comments more obviously related to the build script and exist in discrete blocks
//
//      <!-- [[ build css site.css ]] -->
//          ...stylesheets...
//      <!-- [[ endbuild ]] -->
//
//      <!-- [[ build js head-scripts.js ]] -->
//        ...scripts that need to be in the head...
//      <!-- [[ endbuild ]] -->
//
//      <!-- [[ build js libs.js ]] -->
//        ...libraries...
//      <!-- [[ endbuild ]] -->
//
//      <!-- [[ build js site.js ]] -->
//        ...all your jquery plugins...
//        ...developer authored scripts...
//      <!-- [[ endbuild ]] -->
//

task('htmltags', 'Process html file ', function(options, em) {

  invoke('mkdirs');

  gem.on('end:mkdirs', function() {
    var source = path.join(__dirname, '..', dir.intermediate),
      files = file.pages.default.include.split(', ').map(function(f) {
        return path.resolve(source, f);
      });

    files.forEach(processFile(em));
    em.emit('end');
  });
});

function processFile(em) { return function (file) {
  if(!path.existsSync(file)) return;

  var body = fs.readFileSync(file, 'utf8');

  var lines = body.split('\n'),
    block = false,
    sections = {},
    last;

  lines.forEach(function(l) {
    var build = l.match(regbuild),
      endbuild = regend.test(l);

    if(build) {
      block = true;
      sections[[build[1], build[2]].join(':')] = last = [];
    }

    // switch back block flag when endbuild
    if(block && endbuild) {
      last.push(l);
      block = false;
    }

    if(block && last) {
      last.push(l);
    }
  });

  //sections = sections.map(trim);
  Object.keys(sections).forEach(function(bundle) {
    var parts = bundle.split(':'),
      processor = parts[0],
      file = parts[1],
      content = sections[bundle];

    em.emit('log', 'Processing bundle: ' + file + ' with ' + processor + ' css processor ');

    // Processors are the files in processors/, a [[ build processor filename.ext ]] directive
    // directly drives wich processors handle the replacement.
    body = body.replace(content.join('\n'), processors[processor].call(em, file, content));
  });

  fs.writeFileSync(file, body, 'utf8');
}}

function trim(line) {
  return line.trim();
}
