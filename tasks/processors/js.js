
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
  console.log('JS processor: ', file);

  var emitter = new EventEmitter();

  var base = path.resolve(file),
    filename = path.basename(file),
    dirname = path.dirname(base);

  jsdom.env({
    html: content,
    src: [jquery],
    done: function(err, window) {
      var $ = jquerify(window.$);

      // example:
      //  Listing all script tags in the snippet of html
      //
      var files = [];
      $('script[src]').each(function() {
        var src = $(this).attr('src');
        console.log(' » ', filename, $(this).attr('src'));
        files.push(src);
      });


      // Using md5 plugin helper, concat and rev.
      $('script[src]').md5('./intermediate/' + output, function(err, hash) {
        if(err) throw err;
        console.log('hash:', arguments);
        var href = output.split('/').slice(0, -1).concat(hash + '.' + path.basename(output)).join('/');
        emitter.emit('end', content, '<script defer src="' + href + '"></script>');
      });


      /* * /
      var md5 = $('script[src]')
        // Concat writes file to ./intermediate/script-concat.js
        .concat('./intermediate/script-concat.js')
        // Minify do the concat/min and write files to output (only one of
        // concat/minify call is required, just here to illusrate)
        .minify('./intermediate/boyah/scripts.js')
        // md5, readFile, do the concat and returns the md5 hash for the resulting file
        .md5();
      /* */

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

// Augment jQuery namespace and return the new $ object.
// Todo: refactor, and use a cache system for these readFileSync calls.
function jquerify($) {

  $.fn.concat = function(to) {
    console.log('About to concat stuff', to);
    var out = [],
      ln = this.length - 1;

    console.log('Length: ', this.length);

    return this.each(function(i, val) {
      // concat any assets
      var src = this.href || this.src,
        file = fs.readFileSync(path.resolve(src), 'utf8');;

      console.log('concat', path.resolve(src), i);
      out.push(file);

      console.log(ln);
      if(ln--) return;

      fs.writeFileSync(path.resolve(to), out.join('\n\n'));
    });
  };

  $.fn.minify = function(to) {
    console.log('About to min stuff', to);
    var out = [],
      ln = this.length - 1;

    console.log('Length: ', this.length);

    return this.each(function() {
      var src = this.href || this.src,
        file = fs.readFileSync(path.resolve(src), 'utf8'),
        // todo: the regex to also catch min.css
        minified = /\min\.js$/.test(path.basename(src)),
        dest = path.resolve(to),
        dirname = path.dirname(dest);

      console.log('min', minified, path.resolve(src));


      out.push(minified ? file : min(file));

      if(ln--) return;
      mkdirp(dirname, 0755, function(err) {
        if(err) throw err;
        fs.writeFileSync(dest, out.join('\n\n'));
      });
    });
  };

  $.fn.md5 = function(file, cb) {
    var out = toArray(this).map(function(it) {
      var src = it.href || it.src;
      return fs.readFileSync(path.resolve(src), 'utf8');
    }).join('\n\n');

    // getter: break the chain
    var md5 = crypto.createHash('md5');
    md5.update(out);

    var hash = md5.digest('hex');

    if(file && cb) {
      file = path.resolve(file.split('/').slice(0, -1).concat(hash + '.' + path.basename(file)).join('/'));
      console.log('File write file to', file);
      mkdirp(path.dirname(file), 0755, function(err) {
        if(err) throw err;
        fs.writeFile(file, out, function(err) {
          cb(err, hash, file);
        });
      });
    }

    // getter: return hash, break the chain
    // setter: file specified return this and dont break the chain
    return file ? this : hash;
  };

  $.fn.writeTo = function(){
    return this.each(function(){});
  };

  return $;
}
