
// Run some jQuery on a html fragment
var jsdom = require('jsdom'),
  fs = require('fs'),
  path = require('path'),
  EventEmitter = require('events').EventEmitter,
  jquery = fs.readFileSync(path.join(__dirname, '..', 'support', 'jquery.js'), 'utf8'),
  plugins = require('./plugins/jquery.fs');

// API usage example
// needs refactoring
var processor = module.exports = function processor(file, content, output, em) {
  em.emit('log', 'JS processor: ' + file);

  var emitter = new EventEmitter();

  var base = path.resolve(file),
    filename = path.basename(file),
    dirname = path.dirname(base);

  jsdom.env({
    html: content,
    src: [jquery],
    done: function(err, window) {
      var $ = extend(window.$, em, plugins);

      // example:
      //  Listing all script tags in the snippet of html
      //
      var files = [];
      $('script[src]').each(function() {
        var src = $(this).attr('src');
        em.emit('log', filename +  $(this).attr('src'));
        files.push(src);
      });

      em.emit('log', 'Process bundle » ' + output);

      var scripts = $('script[src]').concat('intermediate/foobar/kkk' + output, function(err) {
        if(err) throw err;
        em.emit('log', 'File created » intermediate/foobar/kkk' + output);
      });

      // todo: handle dir/file arguments. When dir, should create with default name.
      scripts.minify('intermediate/minified/stuff/with/a/long/path/' + output, function(err) {
        if(err) throw err;
        em.emit('log', 'Minification ok ' + output);
      });

      $('script[src]').md5('./intermediate/' + output, function(err, hash) {
        if(err) throw err;
        console.log('hash:', arguments);
        var href = output.split('/').slice(0, -1).concat(hash + '.' + path.basename(output)).join('/');
        emitter.emit('end', content, '<script defer src="' + href + '"></script>');
      });
    }
  });

  return emitter;
};

function extend($, em, pmodule) {
  $.extend($.fn, pmodule($, em));
  return $;
}
