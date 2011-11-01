
var path = require('path'),
  fs = require('fs'),
  jsdom = require('jsdom'),
  async = require('async'),
  EventEmitter = require('events').EventEmitter,
  jquery = fs.readFileSync(path.join(__dirname, 'support', 'jquery.js'), 'utf8'),
  plugins = require('./processors/plugins/jquery.fs');

// https://github.com/h5bp/html5-boilerplate/issues/831

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


return console.log(processors);


task('intro', 'bla bla bla', function(options, em) {

  var intro = [
    '',
    "Cool, let's start..",
  ].join('\n');

  em.emit('log', intro);
});

task('htmltags', 'Process html files', function(options, em) {
  invoke('mkdirs');
  gem.on('end:mkdirs', function() {
    var source = path.join(__dirname, '..', dir.intermediate),
      files = file.pages.default.include.split(', ').map(function(f) {
        return path.resolve(source, f);
      });

    console.log(files);
    async.forEach(files, processFile(em), function(err) {
      if(err) return em.emit('error', err);
      em.emit('log', 'Good to gooo');
      em.emit('data', arguments);

      em.emit('end');
    });

  });
});


// ## Helpers
//
// The process file function is the asyns.forEach iterator function.  It tries
// to read the file content from the file system, and bootstrap a jsdom
// environement for each of these. The `document` processor is then called
// given an extended version of jQuery (with few fs plugin helper: concat,
// minify, rev, md5), the instance of the task EventEmitter, and a callback to
// call when the processor is done.
//
// The processor might have change the dom tree. The content of
// `window.document.innerHTML` is then used to replace the original file.
function processFile(em) { return function (file, cb) {


  return fs.readFile(file, 'utf8', function(err, body) {
    if(err) return cb(err);

    // bootstrap a jsdom env for each files, done in // for now
    // may ends up doing it sequentially if needed
    jsdom.env({
      html: body,
      src: [jquery],
      done: function(err, window) {
        if(err) return em.emit('error', err);
        var $ = extend(window.$, em, plugins);
        // todo: clarify params here, processors should probably don't know
        // which html fragment is replaced.

        processors.document.call(em, $, file, body, em, function(err) {
          if(err) return em.emit('error', err);
          // Write the new content, and keep the doctype safe (innerHTML
          // string doesnt include it).
          fs.writeFile(file, '<!doctype html>' + window.document.innerHTML, cb);
        });
      }
    });
  });
}}

// ### extend
// Extend the given jQuery object prototype with few helper
// functions. They're in `processors/plugins/jquery.fs`. The module
// is called given references to $ and the build script event emitter.
function extend($, em, pmodule) {
  $.extend($.fn, pmodule($, em));
  return $;
}
