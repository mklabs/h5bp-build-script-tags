var path = require('path');

module.exports = function($, output, html, em, cb) {
  // this === em
  this.emit('log', 'Start of JS processor, outputing without defer attribute');

  $('script[src]').md5('./intermediate/' + output, function(err, hash) {
    if(err) return em.emit('error', err);
    var href = output.split('/').slice(0, -1).concat(hash + '.' + path.basename(output)).join('/');
    return cb(null, html, '<script src="' + href + '"></script>');
  });
};
