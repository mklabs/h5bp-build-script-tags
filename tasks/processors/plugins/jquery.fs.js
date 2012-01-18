
var path = require('path'),
fs = require('fs'),
mkdirp = require('mkdirp'),
uglify = require('uglify-js'),
crypto = require('crypto'),
slice = Array.prototype.slice;

// todo: implement basic cache system for the readFileSync calls.

module.exports = {

  foobar: function foobar(o) {
    o = o || {};
    if(!this.length) return this;
    return this.each(function() {});
  },

  concat: function concat(to, cb) {
    if(!this.length) return this;

    var out = [],
      ln = this.length - 1,
      dest = path.resolve(to),
      dirname = path.dirname(dest);

    to = to || 'default.js';
    cb = cb || $.noop;

    console.log('Concat ' + ln + ' file' + (ln > 1 ? 's' : ''));

    return this.each(function(i, val) {
      // concat any assets
      var src = this.href || this.src,
        file = fs.readFileSync(path.resolve(src), 'utf8');

      out.push(file);

      console.log('Concat file » ' + src + ' to ' + path.resolve(to));

      if(ln--) return;

      console.log('Write concat files to ' + dest);
      path.exists(dirname, function(exists) {
        if(exists) return fs.writeFile(dest, out.join('\n\n'), cb);

        mkdirp(dirname, 0755, function() {
          fs.writeFile(dest, out.join('\n\n'), cb);
        });
      });
    });
  },

  minify: function minify(to, cb) {
    if(!this.length) return this;

    var out = [],
      ln = this.length - 1,
      dest = path.resolve(to),
      dirname = path.dirname(dest);

    to = to || 'default.min.js';
    cb = cb || $.noop;

    console.log('Concat/Min ' + ln + ' file' + (ln > 1 ? 's' : ''));


    return this.each(function() {
      var src = this.href || this.src,
        file = fs.readFileSync(path.resolve(src), 'utf8'),
        // todo: the regex to also catch min.css
        minified = /\min\.js$/.test(path.basename(src)),
        dest = path.resolve(to),
        dirname = path.dirname(dest);

      out.push(minified ? file : min(file));

      console.log('Minify file » ' + src);

      if(ln--) return;

      console.log('Write minified files to ' + dest);
      path.exists(dirname, function(exists) {
        if(exists) return fs.writeFile(dest, out.join('\n\n'), cb);

        mkdirp(dirname, 0755, function() {
          fs.writeFile(dest, out.join('\n\n'), cb);
        });
      });
    });
  },

  md5: function md5(file , cb) {
    if(!this.length) return this;

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
  }
};


// ### helpers


// #### min
function min(source) {
  var jsp = uglify.parser,
    pro = uglify.uglify,
    ast = jsp.parse(source);

  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast);
}

function toArray(obj) {
  return slice.call(obj);
}

