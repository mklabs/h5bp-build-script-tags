
// Run some jQuery on a html fragment
var jsdom = require('jsdom'),
  crypto = require('crypto'),
  fs = require('fs'),
  path = require('path'),
  EventEmitter = require('events').EventEmitter,
  mkdirp = require('mkdirp'),
  jquery = fs.readFileSync(path.join(__dirname, '..', 'support', 'jquery.js'), 'utf8');

// API usage example
var processor = module.exports = function processor(file, content, output) {
  console.log('CSS processor: ', file);
  // do the processing here, and make sure to return the result.
  // todo: do the same as js blocks here
  //
  // This is an instance of event emitter, the task could listen for
  // specific events, namely the end one.

  var filename = path.basename(file),
    dirname = path.dirname(file);

  // needs refactoring
  return processor.dom(filename, dirname, output, content, [jquery]);
};

processor.dom = function dom(filename, basename, output, html, src) {
  var emitter = new EventEmitter();
  //  a match is a valid html fragment
  console.log('Paths are relative to ', basename);
  console.log('Loading dom environment for: ', filename);
  console.log(html);
  jsdom.env({
    html: html,
    src: src,
    done: function(errors, window) {
      var $ = window.$,
        sources = [];

      // example:
      //  Listing all links in the snippet of html
      //
      $('link[href]').each(function() {
        console.log(' » ', $(this).attr('href'));
      });

      var hrefs = toArray($('link[href]')).map(function(it) {
        var href = path.resolve(basename, $(it).attr('href'));
        console.log(' -', href);

        emitter.emit('link', it);
        return href;
      });

      // For each hrefs parsed, get the content of the file, concat them
      // (in the same order), rev the filename, and optionally minify
      // them
      sources = hrefs.map(function(source) {
        return fs.readFileSync(source, 'utf8');
      }).join('\n\n')

      var dest = path.resolve(basename, output),
        dir = path.dirname(dest),
        name = checksum(sources) + '.' + path.basename(dest);

      console.log('Writing to ', path.resolve(basename, output));
      console.log('Create folder ', dir ,'if not already there');

      mkdirp(dir, 0755, function(err) {
        // throw for now..
        if(err) throw err;

        console.log('Created dir', dir);
        console.log('Now writes revved file: ', name);

        fs.writeFile(path.join(dir, name), sources, function(err) {
          // throw for now..
          if(err) throw err;
          return emitter.emit('end', name, sources, {
            fragment: html,
            replacement: '<link rel="stylesheet href="' + output + '">'
          });
        });
      });
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
