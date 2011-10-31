// Run some jQuery on an html fragment
var path = require('path');

module.exports = function($, output, html, em, cb) {
  // this === em
  this.emit('log', 'Start of JS processor');

  // concat and minify here just for testing, the real use case is md5 and where
  // the callback call happen
  var scripts = $('script[src]').concat('intermediate/foobar/kkk' + output, function(err) {
    if(err) return em.emit('error', err);
    em.emit('log', 'File created » intermediate/foobar/kkk' + output);
  });

  // todo: handle dir/file arguments. When dir, should create with default name.
  scripts.minify('intermediate/minified/stuff/with/a/long/path/' + output, function(err) {
    if(err) return em.emit('error', err);
    em.emit('log', 'Minification ok ' + output);
  });

  $('script[src]').md5('./intermediate/' + output, function(err, hash) {
    if(err) return em.emit('error', err);
    var href = output.split('/').slice(0, -1).concat(hash + '.' + path.basename(output)).join('/');
    return cb(null, html, '<script defer src="' + href + '"></script>');
  });
};
