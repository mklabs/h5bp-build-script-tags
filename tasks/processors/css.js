// Run some jQuery on an html fragment
var path = require('path');

module.exports = function($, output, html, em, cb) {
  // this === em
  this.emit('log', 'Start of CSS processor');

  $('link[href]').md5('intermediate/' + output, function(err, hash, file) {
    if(err) return em.emit('error', err);
    var href = output.split('/').slice(0, -1).concat(hash + '.' + path.basename(output)).join('/');

    em.emit('log', 'Rev concat css files ok ' + output + ' ' + hash);

    // clarfiy wheter callback/emitter is confusing, or just opt to use
    // the emitter, with a special replace event or something (not end,
    // already has semantic in build script)
    return cb(null, html, '<link rel="stylesheet" href="' + href + '">');
  });
};

