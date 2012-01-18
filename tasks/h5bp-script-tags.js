
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

// Load processors, these are autoloaded from `./processors/*.js`, the filename is
// used as processors hash key.
var processors = {};
fs.readdirSync(path.join(__dirname, 'processors')).forEach(function(file) {
  var filepath = path.resolve(__dirname, 'processors', file),
    filename = path.basename(file).replace(path.extname(file), '');

  if(!fs.statSync(filepath).isFile()) return;

  processors[filename] = require(filepath);
});


// ## dombuild
//
// Iterates through each files and execute the dombuild on top of its content.
//
//    dombuild(files, [config, ] callback);
//
// The `files` parameter is an array of strings. Each element in the array is
// the name of the file to process. Gets resolved against cwd.
//
// The optional `options` parameter is an object hash of build config parameters.
//
// * `dirname`: defaults to `cwd`, to which path files get resolved.
//
// Finally, `callback` is a function that will be called when all files have been processed,
// or when an arror has been encoutered.
//

var dombuild = module.exports = function dombuild(files, options, cb) {

  if(!cb) {
    cb = options;
    options = {};
  }

  options.dirname = options.dirname || process.cwd();

  var files = files.map(function(f) {
    return path.resolve(options.dirname, f);
  });

  async.forEach(files, processFile, function(err) {
    if(err) return cb(err);
    console.log('Process done');
    cb();
  });

};


// ## Helpers
//
// The process file function is the asyns.forEach iterator function.  It tries
// to read the file content from the file system, and bootstrap a jsdom
// environement for each of these. The `document` processor is then called
// given an extended version of jQuery (with few fs plugin helper: concat,
// minify, rev, md5).
//
// The processor might have change the dom tree. The content of
// `window.document.innerHTML` is then used to replace the original file.
//
function processFile(file, cb) {

  fs.readFile(file, 'utf8', function(err, body) {
    if(err) return cb(err);

    // bootstrap a jsdom env for each files, done in // for now
    // may ends up doing it sequentially if needed
    jsdom.env({
      html: body,
      src: [jquery],
      done: function(err, window) {
        if(err) return cb(err);
        var $ = attachPlugins(window.$);
        // todo: clarify params here, processors should probably don't know
        // which html fragment is replaced.

        processors.document($, function(err) {
          if(err) return cb(err);
          // Write the new content, and keep the doctype safe (innerHTML
          // string doesnt include it).

          console.log('Processing of', file, 'done.');
          fs.writeFile(file, '<!doctype html>' + window.document.innerHTML, cb);
        });
      }
    });
  });

}

// ### attachPlugins
// Extend the given jQuery object prototype with few helper
// functions. They're in `processors/plugins/jquery.fs`. The module
// is called given references to $ and the build script event emitter.
function attachPlugins($) {
  $.extend($.fn, plugins);
  return $;
}
