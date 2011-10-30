
var path = require('path'),
  fs = require('fs'),
  EventEmitter = require('events').EventEmitter;

// https://github.com/h5bp/html5-boilerplate/issues/831
//

var regbuild = /^\s*<!--\s*\[\[\s*build\s(\w+)\s([\w\d\.\-_\/]+)\s*\]\]\s*-->/,
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

task('htmltags', 'Process html files', function(options, em) {
  invoke('mkdirs');
  gem.on('end:mkdirs', function() {
    var source = path.join(__dirname, '..', dir.intermediate),
      files = file.pages.default.include.split(', ').map(function(f) {
        return path.resolve(source, f);
      });

    files.forEach(processFile(em));
  });
});

task('usemin', 'Replace bundle reference in HTML markup', function(options, em) {
  em.emit('log', 'doing nothing.. for the sake of testing..');

  setTimeout(function(){ em.emit('end'); }, 2000);
});

task('js.all.minify', 'Overiddes costly minification process', function(options, em) {
  em.emit('log', 'doing nothing.. for the sake of testing..');
  setTimeout(function(){ em.emit('end'); }, 2000);
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


  var bundles = Object.keys(sections),
    ln = bundles.length,
    next = function(em) {
      if(--ln) return;
      console.log('Body: ', body);
      fs.writeFileSync(file, body, 'utf8');
      em.emit('end');
    };


  bundles.forEach(function(bundle) {
    var parts = bundle.split(':'),
      processor = processors[parts[0]],
      content = sections[bundle].join('\n');

    em.emit('log', 'Processing bundle: ' + parts[1] + ' with ' + parts[0] + ' css processor ');

    // Processors are the files in processors/, a [[ build processor filename.ext ]] directive
    // directly drives which processors handle the replacement.
    if(!processor) return em.emit('error', new Error('Unkown processor: ' + parts[0]));

    var handler = processor(file, content, parts[1]);


    // Processors are the files in processors/, a [[ build processor filename.ext ]] directive
    // directly drives wich processors handle the replacement.
    if(!(handler instanceof EventEmitter)) {
      body = body.replace(content, handler);
      return next(em);
    }

    processor(file, content, parts[1])
      .on('end', function(bundle, output, desc) {
        // file: full path of the file to create/update
        // content: the concat/min results of processors
        console.log('Coool, it works.');

        em.emit('log', 'Processors ' + parts[0] + ' done');
        em.emit('data', {
          file: bundle,
          desc: desc
        });

        body = body.replace(desc.fragment, desc.replacement);
        next(em);
      });

  });

}}

function trim(line) {
  return line.trim();
}
