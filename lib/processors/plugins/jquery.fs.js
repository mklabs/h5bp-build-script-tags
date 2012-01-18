
var path = require('path'),
  url = require('url'),
  fs = require('fs'),
  crypto = require('crypto'),
  mkdirp = require('mkdirp'),
  uglify = require('uglify-js'),
  cleanCss = require('clean-css'),
  slice = Array.prototype.slice,
  pathSplit = path.join('/');


module.exports = {

  // not used that much, md5 is the main one. Might be killed off
  // or refacored
  concat: function concat(to, cb) {
    if(!this.length) return this;

    var out = [],
      ln = this.length - 1,
      dest = path.resolve(to),
      dirname = path.dirname(dest);

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

  // not used that much, md5 is the main one. Might be killed off
  // or refacored
  minify: function minify(to, cb) {
    if(!this.length) return this;

    var out = [],
      ln = this.length - 1,
      dest = path.resolve(to),
      dirname = path.dirname(dest);

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

  md5: function md5(dirname, file, cb) {
    if(!this.length) return this;

    // Build a concat'd version of each files
    var out = toArray(this).map(function(it) {
      var src = path.resolve(dirname, it.attribs.href || it.attribs.src),
        body = fs.readFileSync(src, 'utf8');

      // minified, optionnaly..
      body = path.extname(src) === '.js' && !(/min\.js$/.test(src)) ? min(body) :
        // same for css files
        path.extname(file) === '.css' && !(/min\.css$/.test(src)) ? cssmin(body, path.dirname(src)) :
        // otherwise, leave it be
        body;

      return body;
    }).join('\n\n');

    file = path.resolve(dirname, path.dirname(file), sha1(out, 8) + '.' + path.basename(file));
    mkdirp(path.dirname(file), 0755, function(err) {
      if(err) return cb(err);
      fs.writeFile(file, out, function(err) {
        if(err) return cb(err);
        cb(null, file);
      });
    });

    return this;
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

function sha1(out, ln) {
  var sha = crypto.createHash('md5');
  sha.update(out);
  return sha.digest('hex').slice(0, ln);
}

function toArray(obj) {
  return slice.call(obj);
}

// Recursive css @imports replace helper, a little bit more complicated than a simple helper.
// Should go in its own file, not mentioning all the regex that goes along.
var rUrl = /@import url\(['"]?([^\)]+)['"]?\)/g,
  rQuote = /@import "([^"]+)"/g,
  rSingle = /@import '[^']+'/g,
  // css url regex borrowed to r.js, url paths replaces inspired by rjs
  // reading through rjs was super handy.
  rCssUrl = /url\(\s*([^\)]+)\s*\)?/g,
  fileRoot = path.resolve('/');


function cssmin(body, root, level) {

  var reg = rUrl.test(body) ? rUrl :
    rQuote.test(body) ? rQuote :
    rSingle.test(body) ? rSingle :
    null;

  level = level || root;

  console.log('+++++', level, root);

  body = body.replace(reg, function(w, match) {
    // replace any trailing ' or "
    match = match.replace(/^['"]/, '').replace(/['"]$/, '');

    var p = path.resolve(level, match);

    if(!path.existsSync(p)) {
      console.error('Invalid @import file → ' + p);
      return w;
    }

    var content = fs.readFileSync(p, 'utf8');


    content = content.replace(rCssUrl, function(w, urlpath) {
      // replace any trailing ' or "
      urlpath = urlpath.replace(/^['"]/, '').replace(/['"]$/, '');

      // first, let's check that url is relative, eg. check that no protocol were parsed
      if(url.parse(urlpath).protocol) return w;

      // secondly, check that the url path is not from an @import one
      if(path.extname(urlpath) === '.css') return w;

      // guess the likely location of the new filename
      urlpath = level.replace(path.join(root, '/'), '').replace(pathSplit, '/') + '/' + urlpath;

      return "url(" + urlpath + ")";
    });


    return cssmin(content, root, path.dirname(p));
  });

  return body;
}

