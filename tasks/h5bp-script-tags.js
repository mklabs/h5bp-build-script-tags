
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


    // todo: working with a single file, since this is wrapped
    // in a forEach files, the end event will be triggered for each
    // one
    var next = function(err, html, replacement) {
      if(err) return em.emit('error', err);

      em.emit('log', 'Processor done, replacing with ' + replacement);
      body = body.replace(html, replacement);
      if(--ln) return;

      em.emit('log', 'Update ' + file + ' with processed assets.');
      // Write the new body on latest execustion call
      fs.writeFileSync(file, body, 'utf8');
      em.emit('end');
    };


  bundles.forEach(function(bundle) {
    var parts = bundle.split(':'),
      processor = processors[parts[0]],
      content = sections[bundle].join('\n');

    em.emit('log', 'Processing bundle: ' + parts[1] + ' with ' + parts[0] + ' processor ');

    // Processors are the files in processors/, a [[ build processor filename.ext ]] directive
    // directly drives which processors handle the replacement.
    if(!processor) return em.emit('error', new Error('Unkown processor: ' + parts[0]));

    // bootstrap a jsdom env for each files, done in // for now
    // may ends up doing it sequentially if needed
    jsdom.env({
      html: content,
      src: [jquery],
      done: function(err, window) {
        if(err) return em.emit('error', err);
        var $ = extend(window.$, em, plugins);
        // todo: clarify params here, processors should probably don't know
        // which html fragment is replaced.
        processor.call(em, $, parts[1], content, em, next);
      }
    });
  });

}}

function extend($, em, pmodule) {
  $.extend($.fn, pmodule($, em));
  return $;
}
