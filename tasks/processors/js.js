
// Run some jQuery on a html fragment
var jsdom = require('jsdom'),
  crypto = require('crypto'),
  fs = require('fs'),
  path = require('path'),
  EventEmitter = require('events').EventEmitter,
  mkdirp = require('mkdirp'),
  uglify = require('uglify-js'),
  jquery = fs.readFileSync(path.join(__dirname, '..', 'support', 'jquery.js'), 'utf8');

// API usage example
// needs refactoring
var processor = module.exports = function processor(file, content, output) {
  console.log('JS processor: ', file, arguments);

  var emitter = new EventEmitter();

  var base = path.resolve(file),
    filename = path.basename(file),
    dirname = path.dirname(base);

  jsdom.env({
    html: content,
    src: [jquery],
    done: function(err, window) {
      var $ = window.$;

      // example:
      //  Listing all script tags in the snippet of html
      //
      var files = [];
      $('script[src]').each(function() {
        var src = $(this).attr('src');
        console.log(' » ', filename, $(this).attr('src'));
        files.push(src);
      });

      // Get the content of each files
      files = files.map(function(file) {
        var minified = /min\.js$/.test(file),
          body = fs.readFileSync(path.resolve(file), 'utf8');
        return minified ? body : min(body);
      }).join('\n\n');

      // rev after minification for now, will probably change to be done right after concat
      // and do the min after that.

      var href = path.join(path.dirname(output), checksum(files) + '.' + path.basename(output)),
        dest = path.join(dirname, href);

      fs.writeFileSync(dest, files);
      emitter.emit('end', content, '<script defer src="' + href + '"></script>');
    }
  });

  return emitter;
};

function toArray(obj) {
  return Array.prototype.slice.call(obj);
}

function checksum (file) {
  var md5 = crypto.createHash('md5');
  md5.update(file);
  return md5.digest('hex');
}

function min(source) {
  var jsp = uglify.parser,
    pro = uglify.uglify,
    ast = jsp.parse(source);

  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast);
}
